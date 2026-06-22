import { Pencil } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { toast } from 'sonner';

import { api } from '~/utils/api';

import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../ui/alert-dialog';

export const RenameFriend: React.FC<{
  friendId: number;
  currentName: string | null;
}> = ({ friendId, currentName }) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(currentName ?? '');

  const utils = api.useUtils();
  const renameFriendMutation = api.user.updateFriendName.useMutation();

  const onRename = useCallback(async () => {
    const trimmed = name.trim();
    if ('' === trimmed) {
      return;
    }

    try {
      await renameFriendMutation.mutateAsync({ friendId, name: trimmed });
    } catch (e) {
      console.error('Failed to rename friend', e);
      toast.error('Failed to rename user');
      return;
    }

    utils.user.getFriend.invalidate({ friendId }).catch(console.error);
    utils.expense.getBalances.invalidate().catch(console.error);
    setOpen(false);
  }, [name, friendId, renameFriendMutation, utils]);

  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value),
    [],
  );

  const handleSaveClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      onRename().catch(console.error);
    },
    [onRename],
  );

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Pencil className="size-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Rename user</AlertDialogTitle>
          <AlertDialogDescription>Enter a new name for this user.</AlertDialogDescription>
        </AlertDialogHeader>
        <Input value={name} onChange={handleNameChange} placeholder="Name" autoFocus />
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleSaveClick}
            disabled={'' === name.trim() || renameFriendMutation.isPending}
          >
            Save
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
