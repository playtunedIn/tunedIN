import { useAppDispatch } from '@hooks/store/app-store';
import { addPlayer } from '@store/multiplayer/players-slice/players-slice';
import type { PlayerState } from '@store/multiplayer/players-slice/players-slice.types';

export interface AddPlayerResponse {
  player: PlayerState;
}

export const useUpdatePlayersHandlers = () => {
  const dispatch = useAppDispatch();

  const addPlayerHandler = (data: AddPlayerResponse) => {
    dispatch(addPlayer(data.player));
  };

  return { addPlayerHandler };
};
