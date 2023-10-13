import { describe, expect, it, beforeEach, vi } from 'vitest';
import { getSpotifyData } from '../../testing/mocks/question-generating-service/users';
import { questionFunctions } from '../questions/questions';
import type { QuestionData } from '../types/question-types';
import { findIndicesOfLargestElements } from '../utils/helper-functions';

describe('Questions', () => {
  let spotifyData: QuestionData[];

  beforeEach(() => {
    spotifyData = getSpotifyData();
  });

  describe('Mainstream Junkie', () => {
    it('the player with the most popular recent song is returned', () => {
      const result = questionFunctions.mainstreamJunkie(spotifyData);
      const expectedResult = ['jamie'];
      expect(result.correctAnswer).toEqual(expectedResult);
    });

    it('the players with the most popular recent song are returned (same popularity)', () => {
      spotifyData[0].spotifyData.get_recently_played_tracks.items[0].track.popularity = 20;

      const result = questionFunctions.mainstreamJunkie(spotifyData);
      const expectedResult = ['jamie', 'shayne'];
      expect(result.correctAnswer).toEqual(expectedResult);
    });
    it('no players returned if all players recently listened to NO songs', () => {
      spotifyData[0].spotifyData.get_recently_played_tracks.items = [];
      spotifyData[1].spotifyData.get_recently_played_tracks.items = [];

      const result = questionFunctions.mainstreamJunkie(spotifyData);
      const expectedResult = [''];
      expect(result.correctAnswer).toEqual(expectedResult);
    });
  });

  describe('Hidden Gem Hunter', () => {
    it('the player with the least popular recent song is returned', () => {
      const result = questionFunctions.hiddenGemHunter(spotifyData);
      const expectedResult = ['shayne'];
      expect(result.correctAnswer).toEqual(expectedResult);
    });

    it('the players with the least popular recent song are returned (same popularity)', () => {
      spotifyData[0].spotifyData.get_recently_played_tracks.items[0].track.popularity = 20;

      const result = questionFunctions.hiddenGemHunter(spotifyData);
      const expectedResult = ['jamie', 'shayne'];
      expect(result.correctAnswer).toEqual(expectedResult);
    });
    it('no players returned if all players recently listened to NO songs', () => {
      spotifyData[0].spotifyData.get_recently_played_tracks.items = [];
      spotifyData[1].spotifyData.get_recently_played_tracks.items = [];

      const result = questionFunctions.hiddenGemHunter(spotifyData);
      const expectedResult = [''];
      expect(result.correctAnswer).toEqual(expectedResult);
    });
  });

  describe('The Artist Scout', () => {
    it('the players 3 most recently listened to artists are displayed', () => {
      vi.spyOn(Math, 'floor').mockReturnValue(0); //grabbing Jamie as the "random player"

      const result = questionFunctions.theArtistScout(spotifyData);
      const expectedResult = ['Bruce Springsteen', 'veggi', 'Gorillaz'];
      expect(result.questionDescriptionExtra).toEqual(expectedResult);
    });

    it('the players UNIQUE 3 most recently listened to artists are displayed', () => {
      vi.spyOn(Math, 'floor').mockReturnValue(0); //grabbing Jamie as the "random player"

      spotifyData[0].spotifyData.get_recently_played_tracks.items[2].track.artists[0].name = 'Bruce Springsteen';
      const result = questionFunctions.theArtistScout(spotifyData);
      const expectedResult = ['Bruce Springsteen', 'veggi', 'Heilung'];
      expect(result.questionDescriptionExtra).toEqual(expectedResult);
    });

    it('the players UNIQUE and 3 (or less if less exisit) most recently listened to artists are displayed', () => {
      vi.spyOn(Math, 'floor').mockReturnValue(1); //grabbing Shayne as the "random player"

      spotifyData[1].spotifyData.get_recently_played_tracks.items[0].track.artists[0].name = 'Sam Lamar';
      const result = questionFunctions.theArtistScout(spotifyData);
      const expectedResult = ['Sam Lamar', 'INAKTIV'];
      expect(result.questionDescriptionExtra).toEqual(expectedResult);
    });
  });

  describe('Multifaceted Melophile', () => {
    it('expected # of artists returned for user', () => {
      vi.spyOn(Math, 'floor').mockReturnValue(0); //grabbing Jamie as the "random player"

      const result = questionFunctions.multifacetedMelophile(spotifyData);
      const expectedResult = '8';
      expect(result.questionDescriptionExtra).toEqual(expectedResult);
    });
  });

  describe(' The X-Rated Player', () => {
    it('if multiple biggest numbers, those indices are returned', () => {
      const nums = [1, 3, 2, 2, 3, 1, 3];
      const result = findIndicesOfLargestElements(nums);
      const expected = [1, 4, 6];
      expect(result).toEqual(expected);
    });

    it('if 1 biggest number, that indice is returned', () => {
      const nums = [1, 3, 2, 2, 3, 4, 3];
      const result = findIndicesOfLargestElements(nums);
      const expected = [5];
      expect(result).toEqual(expected);
    });

    it('player with most explicit song is returned', () => {
      spotifyData[0].spotifyData.get_recently_played_tracks.items[0].track.explicit = true;
      const result = questionFunctions.theXRatedPlayer(spotifyData);
      const expected = ['jamie'];
      expect(result.correctAnswer).toEqual(expected);
    });

    it('players with most explicit songs are returned', () => {
      const result = questionFunctions.theXRatedPlayer(spotifyData);
      const expected = ['jamie', 'shayne'];
      expect(result.correctAnswer).toEqual(expected);
    });
  });
});
