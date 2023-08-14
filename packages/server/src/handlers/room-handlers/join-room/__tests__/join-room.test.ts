import { beforeEach, afterEach, describe, vi, it, expect } from "vitest";
import { WebSocket } from 'ws';
import type { JoinRoomReq } from "../join-room.validator";
import { isValidJoinRoomReq, joinRoomHandler } from "../join-room";
import { instance, mock, verify, when } from 'ts-mockito';
import { getValue } from "src/clients/redis/redis-client";
import * as redisClientModule from 'src/clients/redis/redis-client';
import { subscribeGameHandler } from "src/handlers/game-handlers/subscribe-game/subscribe-game";

class MockWebSocket extends WebSocket {
    override send = vi.fn();
    override close = vi.fn();
}


describe('Join Room Handler', () => {

    // it('should call getValue and other functions correctly', async () => {
    //     // Arrange
    //     const wsMock = instance(mock(WebSocket));
    //     const data = { roomId: 'testRoomId', playerId: 'Matttty'};
    //     const getValueMock = mock(redisClientModule.getValue);
    //     const setValueMock = mock(redisClientModule.setValue);
    //     const publishChannelMock = mock(redisClientModule.publishChannel);
    //     const subscribeGameHandlerMock = mock(subscribeGameHandler); // Assuming you have a function import like this
    
    //     // Mock getValue function behavior
    //     when(getValueMock(anything())).thenResolve('gameStateJson');
    
    //     // Mock subscribeGameHandler to do nothing
    //     when(subscribeGameHandlerMock(anything(), anything())).thenResolve();
    
    //     // Act
    //     await joinRoomHandler(wsMock, data);
    
    //     // Assert
    //     verify(getValueMock(data.roomId)).called(); // Verify getValue is called
    //     verify(subscribeGameHandlerMock(wsMock, data.roomId)).called(); // Verify subscribeGameHandler is called
    
    //     // Restore original functions (important for subsequent tests)
    //     when(setValueMock(anything(), anything())).thenResolve();
    //     when(publishChannelMock(anything(), anything())).thenResolve();
    //     // redisClientModule.getValue = redisClientModule.getValue;
    //     // redisClientModule.setValue = redisClientModule.setValue;
    //     // redisClientModule.publishChannel = redisClientModule.publishChannel;
    //   });


      
      it('should call send', () => {
        const mockWebSocket = new MockWebSocket('ws://myexample.com')

        const getValueMock = mock(redisClientModule.getValue);


        const mockJoinRoomReq: JoinRoomReq = {
                    roomId: "mockedRoomId",
                    playerId: "mockedPlayerId"
                }

        when(getValueMock(mockJoinRoomReq.roomId)).thenResolve();

      
        joinRoomHandler(mockWebSocket, mockJoinRoomReq);
      
        expect(mockWebSocket.send).toHaveBeenCalledOnce();
        expect(getValueMock).toHaveBeenCalledOnce();
      });


    // it('Valid Room Join', async () => {

    //     // const mockWebSocket = {} as WebSocket;

    //     const mockWebSocket = {
    //         send: vi.fn(),
    //         close: vi.fn(),
    //     }

    //     // const generateMockWebSocket = () => ({
    //     //     send: vi.fn(),
    //     // })

    //     // const mockWebSocket = {
    //     //     // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
    //     //     send: vi.fn(), // Mock the send method
    //     //     // eslint-disable-next-line @typescript-eslint/no-empty-function
    //     //     close: vi.fn(), // Mock the close method
    //     //     // Add other methods and properties that your code interacts with
    //     //   };

    //     const mockJoinRoomReq: JoinRoomReq = {
    //         roomId: "mockedRoomId",
    //         playerId: "mockedPlayerId"
    //     }

    //     joinRoomHandler(mockWebSocket, mockJoinRoomReq);

    //     const isValid = isValidJoinRoomReq(mockJoinRoomReq);
    //     expect(isValid).toBeTruthy();


    // })
    
});

function anything(): any {
    throw new Error("Function not implemented.");
}
