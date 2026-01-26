import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Background from '../components/ui/Background';
import HomeButton from '../components/HomeButton';
import { colors as palette } from '../styles/colors';
import { spacing, typography } from '../styles/designTokens';
import { buildNotesKey, loadNotes, persistNotes } from '../utils/notes';

export default function NotesScreen({ route, navigation } = {}) {
  const params = route?.params || {};
  const {
    path = 'general',
    field = null,
    sourceType = 'lesson',
    level = null,
    lessonId = null,
    title = 'Notes',
  } = params;

  const storageKey = useMemo(
    () => buildNotesKey({ path, field, sourceType, level, lessonId }),
    [path, field, sourceType, level, lessonId]
  );

  const [draft, setDraft] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
    const parsed = await loadNotes(storageKey);
    setItems(parsed);
    } catch (e) {
      console.warn('[NotesScreen] load failed', e);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [storageKey]);

  useEffect(() => {
    load();
  }, [load]);

  const persist = useCallback(
    async (next) => {
      setItems(next);
    await persistNotes(storageKey, next);
    },
    [storageKey]
  );

  const addNote = useCallback(async () => {
    const text = draft.trim();
    if (!text) return;
    const next = [{ id: `${Date.now()}`, text, createdAt: new Date().toISOString() }, ...items];
    setDraft('');
    await persist(next);
  }, [draft, items, persist]);

  const removeNote = useCallback(
    async (id) => {
      const next = items.filter((n) => n.id !== id);
      await persist(next);
    },
    [items, persist]
  );

  return (
    <Background module="home" variant="brown">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation?.goBack?.()} style={styles.headerButton}>
            <Text style={styles.headerButtonText}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {title || 'Notes'}
            </Text>
            <Text style={styles.headerSubtitle} numberOfLines={1}>
              {field ? `${path} · ${field}` : path}
              {level ? ` · ${level}` : ''}
            </Text>
          </View>
          <HomeButton style={styles.headerButton} />
        </View>

        <View style={styles.composer}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Kirjoita nopea muistiinpano…"
            placeholderTextColor={palette.textSecondary}
            multiline
            style={styles.input}
          />
          <TouchableOpacity
            style={[styles.saveButton, !draft.trim() && styles.saveButtonDisabled]}
            disabled={!draft.trim()}
            onPress={addNote}
          >
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.list}>
          {loading ? (
            <Text style={styles.emptyText}>Loading…</Text>
          ) : items.length === 0 ? (
            <Text style={styles.emptyText}>
              No notes yet. Add a note to remember tricky words, endings, or a useful phrase.
            </Text>
          ) : (
            items.map((n) => (
              <View key={n.id} style={styles.noteCard}>
                <Text style={styles.noteText}>{n.text}</Text>
                <View style={styles.noteFooter}>
                  <Text style={styles.noteMeta}>
                    {n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}
                  </Text>
                  <TouchableOpacity
                    onPress={() =>
                      Alert.alert('Delete note?', 'This cannot be undone.', [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Delete', style: 'destructive', onPress: () => removeNote(n.id) },
                      ])
                    }
                  >
                    <Text style={styles.deleteText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </Background>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerButton: {
    padding: spacing.sm,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  headerButtonText: {
    color: palette.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  headerTitleWrap: {
    flex: 1,
    gap: 2,
  },
  headerTitle: {
    color: palette.textPrimary,
    fontSize: typography.h3,
    fontWeight: '800',
  },
  headerSubtitle: {
    color: palette.textSecondary,
    fontSize: typography.small,
  },
  composer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  input: {
    minHeight: 90,
    borderRadius: 16,
    padding: spacing.md,
    color: palette.textPrimary,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  saveButton: {
    alignSelf: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    backgroundColor: palette.accentPrimary,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: '#06202A',
    fontWeight: '800',
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  emptyText: {
    color: palette.textSecondary,
    lineHeight: 20,
  },
  noteCard: {
    borderRadius: 16,
    padding: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  noteText: {
    color: palette.textPrimary,
    fontSize: typography.body,
    lineHeight: 20,
  },
  noteFooter: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  noteMeta: {
    color: palette.textSecondary,
    fontSize: typography.caption,
  },
  deleteText: {
    color: palette.error,
    fontWeight: '700',
  },
});
