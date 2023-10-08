import { SOCKET_READY_STATES, useMultiplayerClient } from '@hooks/multiplayer';
import { useAppSelector } from '@hooks/store/app-store';

/**
 * FIXME: For demo purposes only! Delete this component once there's a real create room button.
 */
const TempCreateRoomButton = () => {
  const { createRoom, connectionStatus, exitRoom, joinRoom } = useMultiplayerClient();

  const roomId = useAppSelector(state => state.room.roomId);

  if (connectionStatus === SOCKET_READY_STATES.CONNECTING) {
    return <h1>loading</h1>;
  }

  return (
    <>
      <h1>Room ID: {roomId}</h1>
      <button onClick={() => createRoom()}>CREATE ROOM</button>
      <button onClick={() => joinRoom(roomId, 'John Smith')}>JOIN ROOM</button>
      <button onClick={() => exitRoom()}>EXIT ROOM</button>
    </>
  );
};

export default TempCreateRoomButton;
