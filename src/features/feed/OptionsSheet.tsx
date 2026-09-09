import React, { useState } from 'react';
import { Modal, Pressable, Share, StyleSheet, Text, View } from 'react-native';

import { colors, fontSizes, spacing } from '../../theme';
import { getSupabase } from '../../lib/supabase';
import { useAuth } from '../../state/AuthContext';
import type { FeedVideo } from './types';

// Fixed report reason codes per the schema doc.
const REASON_CODES = ['spam', 'harassment', 'copyright', 'inappropriate', 'other'] as const;

type Props = {
  video: FeedVideo | null;
  onClose: () => void;
};

export function OptionsSheet({ video, onClose }: Props) {
  const { session } = useAuth();
  const [pickingReason, setPickingReason] = useState(false);

  if (!video) return null;

  async function report(reasonCode: string) {
    const supabase = getSupabase();
    if (supabase && session) {
      await supabase
        .from('reports')
        .insert({ reporter_id: session.userId, video_id: video!.id, reason_code: reasonCode })
        .then(() => {});
    }
    setPickingReason(false);
    onClose();
  }

  return (
    <Modal transparent visible animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          {!pickingReason ? (
            <>
              <Pressable
                style={styles.row}
                onPress={() => {
                  void Share.share({ message: `${video.title} - ${video.artistName} on Herd` }).catch(() => {});
                  onClose();
                }}
              >
                <Text style={styles.rowText}>Share</Text>
              </Pressable>
              <Pressable style={styles.row} onPress={() => setPickingReason(true)}>
                <Text style={[styles.rowText, { color: colors.danger }]}>Report</Text>
              </Pressable>
              <Pressable style={styles.row} onPress={onClose}>
                <Text style={[styles.rowText, { color: colors.textMuted }]}>Cancel</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Text style={styles.heading}>Why are you reporting this video?</Text>
              {REASON_CODES.map((code) => (
                <Pressable key={code} style={styles.row} onPress={() => report(code)}>
                  <Text style={styles.rowText}>{code}</Text>
                </Pressable>
              ))}
              <Pressable style={styles.row} onPress={() => setPickingReason(false)}>
                <Text style={[styles.rowText, { color: colors.textMuted }]}>Back</Text>
              </Pressable>
            </>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: spacing.sm,
    paddingBottom: spacing.xl,
  },
  heading: {
    color: colors.textMuted,
    fontSize: fontSizes.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  row: { paddingVertical: spacing.md, paddingHorizontal: spacing.lg },
  rowText: { color: colors.text, fontSize: fontSizes.md, textTransform: 'capitalize' },
});
