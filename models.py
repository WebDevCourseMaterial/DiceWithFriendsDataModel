from google.appengine.ext import ndb


class Player(ndb.Model):
  """ Information for a player. """
  display_name = ndb.StringProperty()

  def get_name(self):
    """Returns the best name available for a Player."""
    if self.display_name:
      return self.display_name
    return self.key.string_id() # email address


class Game(ndb.Model):
  """ Dice with Friends game. """
  creator_key = ndb.KeyProperty(kind=Player)
  invitee_key = ndb.KeyProperty(kind=Player)
  creator_scores = ndb.IntegerProperty(repeated=True)
  invitee_scores = ndb.IntegerProperty(repeated=True)
  last_touch_date_time = ndb.DateTimeProperty(auto_now=True)
  is_complete = ndb.BooleanProperty(default=False)

  