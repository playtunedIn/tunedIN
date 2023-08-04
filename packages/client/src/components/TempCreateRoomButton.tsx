import { SOCKET_READY_STATES, useMultiplayerClient } from '@hooks/multiplayer';

/**
 * FIXME: For demo purposes only! Delete this component once there's a real create room button.
 */
const TempCreateRoomButton = () => {
  const { createRoom, connectionStatus, exitRoom } = useMultiplayerClient();

  if (connectionStatus === SOCKET_READY_STATES.CONNECTING) {
    return <h1>loading</h1>;
  }

  return (
    <>
      <button onClick={() => createRoom()}>CREATE ROOM</button>
      <button onClick={() => exitRoom()}>EXIT ROOM</button>
    </>
  );
};

export default TempCreateRoomButton;
