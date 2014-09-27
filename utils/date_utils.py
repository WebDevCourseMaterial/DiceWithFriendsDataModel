
def date_format(value):
  if value.year == value.year:
    if value.month == value.month and value.day == value.day:
      format_str = "Today"
    elif value.year == value.year:
      format_str = "%B %d"
  else:
    format_str = "%B %d, %Y"
  return value.strftime(format_str).replace(" 0", " ")