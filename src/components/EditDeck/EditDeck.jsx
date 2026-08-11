import { useState, useEffect } from 'react';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { supabase } from '../../services/supabase';
import '../CreateDeck/CreateDeck.css'; // Re-use CreateDeck CSS

export default function EditDeck({ isOpen, onClose, onDeckUpdated, deck }) {
  const [deckName, setDeckName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('📁');
  const [showPicker, setShowPicker] = useState(false);
  const [cards, setCards] = useState([{ front: '', back: '' }]);
  const [cardsToDelete, setCardsToDelete] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && deck) {
      setDeckName(deck.title || '');
      setDescription(deck.description || '');
      setSelectedIcon(deck.icon || '📁');
      setCards([{ front: '', back: '' }]); // Reset
      setCardsToDelete([]);
      setError('');
      fetchCards();
    }
  }, [isOpen, deck]);

  const fetchCards = async () => {
    if (!deck) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('cards')
        .select('id, front, back')
        .eq('deck_id', deck.id)
        .order('id', { ascending: true });
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        setCards(data);
      }
    } catch (err) {
      console.error('Error fetching cards:', err);
      setError('Failed to load cards.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const addCard = () => {
    setCards(prev => [...prev, { front: '', back: '' }]);
  };

  const removeCard = (index) => {
    if (cards.length <= 1) return;
    const cardToRemove = cards[index];
    if (cardToRemove.id) {
      setCardsToDelete(prev => [...prev, cardToRemove.id]);
    }
    setCards(prev => prev.filter((_, i) => i !== index));
  };

  const updateCard = (index, field, value) => {
    setCards(prev => prev.map((card, i) =>
      i === index ? { ...card, [field]: value } : card
    ));
  };

  const handleSave = async () => {
    if (!deckName.trim()) {
      setError('Please enter a deck name.');
      return;
    }

    const validCards = cards.filter(c => c.front.trim() && c.back.trim());
    if (validCards.length === 0) {
      setError('Please add at least one card with both front and back content.');
      return;
    }

    setError('');
    setSaving(true);

    try {
      // 1. Update deck
      const deckPayload = {
        title: deckName.trim(),
        description: description.trim() || null,
        icon: selectedIcon,
      };

      const { data: deckData, error: deckError } = await supabase
        .from('decks')
        .update(deckPayload)
        .eq('id', deck.id)
        .select()
        .single();

      // Graceful fallback for missing icon column
      if (deckError && (deckError.code === '42703' || deckError.code === 'PGRST204' || deckError.message?.includes('icon'))) {
        console.warn('Icon column not found, falling back to legacy update.');
        const fallbackPayload = { ...deckPayload };
        delete fallbackPayload.icon;
        const fallbackRes = await supabase.from('decks').update(fallbackPayload).eq('id', deck.id).select().single();
        if (fallbackRes.error) throw fallbackRes.error;
      } else if (deckError) {
        throw deckError;
      }

      // 2. Delete removed cards
      if (cardsToDelete.length > 0) {
        const { error: deleteError } = await supabase
          .from('cards')
          .delete()
          .in('id', cardsToDelete);
        if (deleteError) throw deleteError;
      }

      // 3. Upsert cards
      const cardsToUpsert = validCards.map(c => ({
        id: c.id, 
        deck_id: deck.id,
        front: c.front.trim(),
        back: c.back.trim(),
      }));

      const cardsToUpdate = cardsToUpsert.filter(c => c.id);
      const cardsToInsert = cardsToUpsert.filter(c => !c.id);

      if (cardsToUpdate.length > 0) {
        const { error: updateError } = await supabase
          .from('cards')
          .upsert(cardsToUpdate);
        if (updateError) throw updateError;
      }

      if (cardsToInsert.length > 0) {
        const { error: insertError } = await supabase
          .from('cards')
          .insert(cardsToInsert);
        if (insertError) throw insertError;
      }

      onDeckUpdated?.(deckData || { ...deck, ...deckPayload });
      onClose();
    } catch (err) {
      console.error('Error updating deck:', err);
      setError(err.message || 'Failed to update deck. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="create-deck-overlay" onClick={handleOverlayClick}>
      <div className="create-deck-modal" role="dialog" aria-labelledby="edit-deck-title">
        <div className="create-deck-header">
          <h2 id="edit-deck-title" className="create-deck-title">Edit Deck</h2>
          <button className="create-deck-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="create-deck-body">
          {error && (
            <div className="create-deck-error" role="alert">{error}</div>
          )}
          
          {loading ? (
             <div className="create-deck-field" style={{ textAlign: 'center', padding: '20px' }}>
                Loading deck data...
             </div>
          ) : (
            <>
              <div className="create-deck-field">
                <label className="create-deck-label">Deck Icon</label>
                <div className="create-deck-icon-picker-container">
                  <button
                    className="create-deck-icon-trigger"
                    onClick={() => setShowPicker(!showPicker)}
                    title="Choose an icon"
                  >
                    {selectedIcon}
                  </button>
                  {showPicker && (
                    <div className="create-deck-emoji-popover">
                      <div className="create-deck-emoji-overlay" onClick={() => setShowPicker(false)} />
                      <div className="create-deck-picker-wrapper">
                        <Picker 
                          data={data} 
                          native={true}
                          onEmojiSelect={(emoji) => {
                            setSelectedIcon(emoji.native);
                            setShowPicker(false);
                          }} 
                          theme="light"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="create-deck-field">
                <label htmlFor="deck-name" className="create-deck-label">Deck Name</label>
                <input
                  id="deck-name"
                  type="text"
                  className="create-deck-input"
                  placeholder="e.g. Japanese Vocabulary"
                  value={deckName}
                  onChange={e => setDeckName(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="create-deck-field">
                <label htmlFor="deck-desc" className="create-deck-label">
                  Description <span className="create-deck-optional">(optional)</span>
                </label>
                <textarea
                  id="deck-desc"
                  className="create-deck-textarea"
                  placeholder="What is this deck about?"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={2}
                />
              </div>

              <div className="create-deck-divider">
                <span>Cards ({cards.length})</span>
              </div>

              <div className="create-deck-cards">
                {cards.map((card, index) => (
                  <div key={index} className="create-deck-card-row">
                    <div className="create-deck-card-number">{index + 1}</div>
                    <div className="create-deck-card-fields">
                      <input
                        type="text"
                        className="create-deck-input"
                        placeholder="Front (Question)"
                        value={card.front}
                        onChange={e => updateCard(index, 'front', e.target.value)}
                      />
                      <input
                        type="text"
                        className="create-deck-input"
                        placeholder="Back (Answer)"
                        value={card.back}
                        onChange={e => updateCard(index, 'back', e.target.value)}
                      />
                    </div>
                    <button
                      className="create-deck-remove-card"
                      onClick={() => removeCard(index)}
                      disabled={cards.length <= 1}
                      aria-label={`Remove card ${index + 1}`}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              <button className="create-deck-add-card" onClick={addCard}>
                + Add Card
              </button>
            </>
          )}
        </div>

        <div className="create-deck-footer">
          <button
            className="create-deck-btn create-deck-btn--cancel"
            onClick={onClose}
            disabled={saving || loading}
          >
            Cancel
          </button>
          <button
            className="create-deck-btn create-deck-btn--save"
            onClick={handleSave}
            disabled={saving || loading}
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
