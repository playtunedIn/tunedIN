import { useMultiplayerClient } from '@hooks/multiplayer';

/**
 * FIXME: For demo purposes only! Delete this component once there's a real create room button.
 */
const TempCreateRoomButton = () => {
  const { createRoom } = useMultiplayerClient();

  return <button onClick={() => createRoom()}>CREATE ROOM</button>;
};

export default TempCreateRoomButton;
