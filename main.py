#!/usr/bin/env python
#
# Copyright 2007 Google Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
import os
import jinja2
import webapp2

from handlers import game_handlers
from handlers import main_handlers
from utils import date_utils
from utils import game_utils


# Jinja environment instance necessary to use Jinja templates.
jinja_env = jinja2.Environment(loader=jinja2.FileSystemLoader(os.path.dirname(__file__)), autoescape=True)
jinja_env.filters["date_format"] = date_utils.date_format
jinja_env.filters["game_complete_boolean_format"] = game_utils.game_complete_boolean_format

app = webapp2.WSGIApplication([
    ('/', main_handlers.HomePage),
    ('/play', game_handlers.PlayPage),
    ('/gamesinprogress', game_handlers.GamesInProgressPage),
    ('/completedgames', game_handlers.CompletedGamesWithFriendsPage),

    ('/setdisplayname', main_handlers.SetDisplayNameAction),
    ('/newgame', game_handlers.NewGameAction),
    ('/scoresupdate', game_handlers.ScoresUpdateAction)
], debug=True)
