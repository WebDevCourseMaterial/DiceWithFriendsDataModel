from google.appengine.ext import ndb
import logging

from models import Game

GAME_SCORE_TO_WIN = 10000

def get_all_games_for_player_query(player):
  ''' Returns a query object for all games the player is in. '''
  return Game.query(ndb.OR(Game.creator_key == player.key,
                           Game.invitee_key == player.key))


def get_unfinished_games_query(player):
  ''' Returns a query object for all unfinished games the player is in. '''
  return Game.query(ndb.AND(Game.is_complete == False),
                           ndb.OR(Game.creator_key == player.key,
                                  Game.invitee_key == player.key))


def get_games_in_progress(player):
  ''' Returns two Lists of Game objects.
      If the player's score is <10K the game is in the first list.
      If the player's score is >=10K the game is in the second list. '''
  query = get_unfinished_games_query(player);
  games_less_than_10k = []
  games_10k_or_more = []
  for game in query:
    if is_game_finished_by_player(game, player):
      games_10k_or_more.append(game)
    else:
      games_less_than_10k.append(game)
  return games_less_than_10k, games_10k_or_more


def is_game_finished_by_player(game, player):
  ''' Returns true if the player's score is more than the score needed to win. '''
  if player.key == game.creator_key:
    return sum(game.creator_scores) >= GAME_SCORE_TO_WIN
  return sum(game.invitee_scores) >= GAME_SCORE_TO_WIN

def is_game_complete(game):
  """ Updates the is_complete property for the game. """
  game_round = min(len(game.creator_scores), len(game.invitee_scores))
  creator_score = sum(game.creator_scores[:game_round])
  invitee_score = sum(game.invitee_scores[:game_round])
  return creator_score >= GAME_SCORE_TO_WIN or invitee_score >= GAME_SCORE_TO_WIN

def add_incomplete_game_table_data(incomplete_games, current_player):
  ''' Adds data to the games, based on what Jinja2 would like to display.
      Game object has these additional fields when this method completes:
        opponent_name
        opponent_actual_score (used in games_10k_or_more games)
        official_round
        current_player_round
        is_opponent_finished (used in games_less_than_10k games)'''
  for game in incomplete_games:
    created_by_current_player = game.creator_key == current_player.key
    if created_by_current_player:
      game.opponent_name = game.invitee_key.get().get_name()
      game.current_player_round = len(game.creator_scores)
      opponent_rounds_complete = len(game.invitee_scores)
      game.opponent_actual_score = sum(game.invitee_scores)
    else:
      game.opponent_name = game.creator_key.get().get_name()
      game.current_player_round = len(game.invitee_scores)
      opponent_rounds_complete = len(game.creator_scores)
      game.opponent_actual_score = sum(game.creator_scores)
    game.official_round = min(game.current_player_round, opponent_rounds_complete)
    game.is_opponent_finished = game.opponent_actual_score >= GAME_SCORE_TO_WIN


def game_complete_boolean_format(value):
  return "Yes" if value else "No"
