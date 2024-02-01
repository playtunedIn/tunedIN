import { describe, expect, it, beforeEach, vi } from 'vitest';
import { getSpotifyData } from '../../testing/mocks/question-generating-service/users';
import * as questionFunctions from '../questions/questions';
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
      const expectedResult: string[] = [];
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
      const expectedResult: string[] = [];
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

  describe('Playlist Mastermind', () => {
    it('the expected playlist title is displayed', () => {
      vi.spyOn(Math, 'floor').mockReturnValue(0); //grabbing Jamie as the "random player", and first playlist

      const result = questionFunctions.playlistMastermind(spotifyData);
      const expectedAnswer = ['jamie'];
      const expectedExtraDescr = 'Shayne & Jamie on Island Time';
      expect(result.correctAnswer).toEqual(expectedAnswer);
      expect(result.questionDescriptionExtra).toEqual(expectedExtraDescr);
      expect(result.questionDescriptionExtra).not.toEqual('This user has no playlists');
    });

    it('should return proper extra descr when user has no playlists', () => {
      vi.spyOn(Math, 'floor').mockReturnValue(0); //grabbing Jamie as the "random player"

      spotifyData[0].spotifyData.get_current_users_playlist.items = []; //jamie now has no playlists

      const result = questionFunctions.playlistMastermind(spotifyData);

      const expectedExtraDescr = 'This user has no playlists';
      expect(result.questionDescriptionExtra).toEqual(expectedExtraDescr);
    });
  });

  describe('The Most Popular', () => {
    it('returns the player with the most followers', () => {
      const result = questionFunctions.theMostPopular(spotifyData);
      const expectedAnswer = ['shayne'];
      expect(result.correctAnswer).toEqual(expectedAnswer);
    });

    it('returns multiple players with same followers', () => {
      spotifyData[0].spotifyData.get_current_users_profile.followers.total = 36;

      const result = questionFunctions.theMostPopular(spotifyData);
      const expectedAnswer = ['jamie', 'shayne'];

      expect(result.correctAnswer).toEqual(expectedAnswer);
    });

    it('returns players with 0 followers aka no one is popular', () => {
      spotifyData[0].spotifyData.get_current_users_profile.followers.total = 0;
      spotifyData[1].spotifyData.get_current_users_profile.followers.total = 0;

      const result = questionFunctions.theMostPopular(spotifyData);
      const expectedAnswer = ['jamie', 'shayne'];

      expect(result.correctAnswer).toEqual(expectedAnswer);
    });
  });

  describe('Album Crusader', () => {
    it('the expected album title is displayed', () => {
      vi.spyOn(Math, 'floor').mockReturnValue(1); //grabbing shayne as the "random player", and second recent song
      const result = questionFunctions.albumCrusader(spotifyData);
      const expectedAnswer = ['shayne'];
      const expectedExtraDescr = 'Best of Bassrush: 2021 (Mixed by JEANIE)';
      expect(result.correctAnswer).toEqual(expectedAnswer);
      expect(result.questionDescriptionExtra).toEqual(expectedExtraDescr);
      expect(result.questionDescriptionExtra).not.toEqual('This player has not listened to a song recently');
    });

    it('should return proper extra descr when user has no recently played song', () => {
      vi.spyOn(Math, 'floor').mockReturnValue(1); //grabbing shayne as the "random player", and second recent song

      spotifyData[1].spotifyData.get_recently_played_tracks.items = []; //shayne now has no recent songs

      const result = questionFunctions.albumCrusader(spotifyData);

      const expectedExtraDescr = 'This player has not listened to a song recently';
      expect(result.questionDescriptionExtra).toEqual(expectedExtraDescr);
    });
  });

  describe('Penny Pinching Player', () => {
    it('returns the player with free version', () => {
      const result = questionFunctions.pennyPinchingPlayer(spotifyData);
      const expectedAnswer = ['shayne'];
      expect(result.correctAnswer).toEqual(expectedAnswer);
    });

    it('returns multiple players who have free version', () => {
      spotifyData[0].spotifyData.get_current_users_profile.product = 'free';

      const result = questionFunctions.pennyPinchingPlayer(spotifyData);
      const expectedAnswer = ['jamie', 'shayne'];

      expect(result.correctAnswer).toEqual(expectedAnswer);
    });

    it('returns no players if all have paid version', () => {
      spotifyData[1].spotifyData.get_current_users_profile.product = 'premium';

      const result = questionFunctions.pennyPinchingPlayer(spotifyData);
      const expectedAnswer = ['Nobody!'];

      expect(result.correctAnswer).toEqual(expectedAnswer);
    });
  });

  describe('Collaboration Connoisseur', () => {
    it('returns players who listens to collab songs (and answer has each player only once even if they have multiple songs matching criteria)', () => {
      const moreArtists = [
        {
          external_urls: {
            spotify: 'https://open.spotify.com/artist/3eqjTLE0HfPfh78zjh6TqT',
          },
          href: 'https://api.spotify.com/v1/artists/3eqjTLE0HfPfh78zjh6TqT',
          id: '3eqjTLE0HfPfh78zjh6TqT',
          name: 'Bruce Springsteen',
          type: 'artist',
          uri: 'spotify:artist:3eqjTLE0HfPfh78zjh6TqT',
        },
        {
          external_urls: {
            spotify: 'https://open.spotify.com/artist/3eqjTLE0HfPfh78zjh6TqT',
          },
          href: 'https://api.spotify.com/v1/artists/3eqjTLE0HfPfh78zjh6TqT',
          id: '3eqjTLE0HfPfh78zjh6TqT',
          name: 'Billy Springsteen',
          type: 'artist',
          uri: 'spotify:artist:3eqjTLE0HfPfh78zjh6TqT',
        },
      ];

      spotifyData[0].spotifyData.get_recently_played_tracks.items[0].track.artists = moreArtists;

      const result = questionFunctions.collaborationConnoisseur(spotifyData);
      const expectedAnswer = ['jamie', 'shayne'];
      expect(result.correctAnswer).toEqual(expectedAnswer);
    });

    it('returns no player if noone listened to songs ft more than one artist', () => {
      const oneArtist = [
        {
          external_urls: {
            spotify: 'https://open.spotify.com/artist/3eqjTLE0HfPfh78zjh6TqT',
          },
          href: 'https://api.spotify.com/v1/artists/3eqjTLE0HfPfh78zjh6TqT',
          id: '3eqjTLE0HfPfh78zjh6TqT',
          name: 'Bruce Springsteen',
          type: 'artist',
          uri: 'spotify:artist:3eqjTLE0HfPfh78zjh6TqT',
        },
      ];

      spotifyData[0].spotifyData.get_recently_played_tracks.items[0].track.artists = oneArtist;
      spotifyData[0].spotifyData.get_recently_played_tracks.items[1].track.artists = oneArtist;
      spotifyData[0].spotifyData.get_recently_played_tracks.items[2].track.artists = oneArtist;
      spotifyData[1].spotifyData.get_recently_played_tracks.items[0].track.artists = oneArtist;
      spotifyData[1].spotifyData.get_recently_played_tracks.items[1].track.artists = oneArtist;
      spotifyData[1].spotifyData.get_recently_played_tracks.items[2].track.artists = oneArtist;

      const result = questionFunctions.collaborationConnoisseur(spotifyData);
      const expectedAnswer = ['No player recently listened to songs ft. more than one artist'];
      expect(result.correctAnswer).toEqual(expectedAnswer);
    });

    it('returns no player if noone listened to enough songs', () => {
      const lessTracks = spotifyData[0].spotifyData.get_recently_played_tracks.items.slice(0, 2);

      spotifyData[0].spotifyData.get_recently_played_tracks.items = lessTracks;
      spotifyData[1].spotifyData.get_recently_played_tracks.items = lessTracks;

      const result = questionFunctions.collaborationConnoisseur(spotifyData);
      const expectedAnswer = ['No player recently listened to songs ft. more than one artist'];
      expect(result.correctAnswer).toEqual(expectedAnswer);
    });
  });

  describe('Song Spy', () => {
    it('the expected song title is displayed', () => {
      vi.spyOn(Math, 'floor').mockReturnValue(1); //grabbing shayne as the "random player", and second song

      const result = questionFunctions.songSpy(spotifyData);
      const expectedAnswer = ['shayne'];
      const expectedExtraDescr = 'Broken Machine - Mixed';
      expect(result.correctAnswer).toEqual(expectedAnswer);
      expect(result.questionDescriptionExtra).toEqual(expectedExtraDescr);
      expect(result.questionDescriptionExtra).not.toEqual('This user has not listened to a song recently');
    });

    it('should return proper extra descr when user has no recent song', () => {
      vi.spyOn(Math, 'floor').mockReturnValue(1); //grabbing shayne as the "random player"

      spotifyData[1].spotifyData.get_recently_played_tracks.items = []; //shayne now has no songs

      const result = questionFunctions.songSpy(spotifyData);

      const expectedExtraDescr = 'This user has not listened to a song recently';
      expect(result.questionDescriptionExtra).toEqual(expectedExtraDescr);
    });
  });

  describe('Artist On My Mind', () => {
    it('the expected artist is displayed', () => {
      vi.spyOn(Math, 'floor').mockReturnValue(1); //grabbing shayne as the "random player", and second song

      const result = questionFunctions.artistOnMyMind(spotifyData);
      const expectedAnswer = ['shayne'];
      const expectedExtraDescr = 'Sam Lamar';
      expect(result.correctAnswer).toEqual(expectedAnswer);
      expect(result.questionDescriptionExtra).toEqual(expectedExtraDescr);
      expect(result.questionDescriptionExtra).not.toEqual('This user has not listened to a song recently');
    });

    it('should return proper extra descr when user has no recent song', () => {
      vi.spyOn(Math, 'floor').mockReturnValue(1); //grabbing shayne as the "random player"

      spotifyData[1].spotifyData.get_recently_played_tracks.items = []; //shayne now has no songs

      const result = questionFunctions.artistOnMyMind(spotifyData);

      const expectedExtraDescr = 'This user has not listened to a song recently';
      expect(result.questionDescriptionExtra).toEqual(expectedExtraDescr);
    });
  });

  describe('Album Collector', () => {
    it('the expected album titles are displayed', () => {
      vi.spyOn(Math, 'floor').mockReturnValue(1); //grabbing shayne as the "random player"
      const result = questionFunctions.albumCollector(spotifyData);
      const expectedAnswer = ['shayne'];
      const expectedExtraDescr = ['Volume 1', 'Best of Bassrush: 2021 (Mixed by JEANIE)', 'FUBAR'];
      expect(result.correctAnswer).toEqual(expectedAnswer);
      expect(result.questionDescriptionExtra).toEqual(expectedExtraDescr);
      expect(result.questionDescriptionExtra).not.toEqual(
        'This player has not listened to enough songs recently (less than 3)'
      );
    });

    it('should return proper extra descr when user has less than three recently played songs', () => {
      vi.spyOn(Math, 'floor').mockReturnValue(1); //grabbing shayne as the "random player"

      const twoSongs = spotifyData[1].spotifyData.get_recently_played_tracks.items.splice(0, 2);
      spotifyData[1].spotifyData.get_recently_played_tracks.items = twoSongs;

      const result = questionFunctions.albumCollector(spotifyData);

      const expectedExtraDescr = ['This player has not listened to enough songs recently (less than 3)'];
      expect(result.questionDescriptionExtra).toEqual(expectedExtraDescr);
    });
  });
});
