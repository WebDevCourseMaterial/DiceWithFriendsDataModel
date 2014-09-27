
from google.appengine.api import users
import webapp2

import main
from utils import player_utils

### Pages ###

class BasePage(webapp2.RequestHandler):
  """Page handlers should inherit from this one."""
  def get(self):
    user = users.get_current_user()
    if not user:
      template = main.jinja_env.get_template("templates/home.html")
      self.response.out.write(template.render({'login_url': users.create_login_url(self.request.referer)}))
    else:
      player = player_utils.get_player_from_email(user.email())
      show_set_name_modal = not player.display_name or not len(player.display_name) > 0
      values = {'player': player,
                'show_set_name_modal': show_set_name_modal,
                'logout_url': users.create_logout_url("/")}
      self.update_values(player, values)
      template = main.jinja_env.get_template(self.get_template())
      self.response.out.write(template.render(values))

  def update_values(self, player, values):
    raise Exception("Subclasses must override this method")


### Actions ###

class BaseAction(webapp2.RequestHandler):
  """ALL action handlers should inherit from this one."""
  def post(self):
    user = users.get_current_user()
    if not user:
      raise Exception("Missing user!")
    player = player_utils.get_player_from_email(user.email())
    self.handle_post(player)

  def get(self):
    self.post()

  def handle_post(self, player):
    raise Exception("Subclass must implement handle_post!")
