/*
 * Model object that tracks the state of a Dice turn for one player.
 */

rh.dwf.DiceRound = function() {
	this.dice = [];
	for (var i = 0; i < 6; ++i) {
		this.dice.push(new rh.dwf.Die(i, rh.dwf.Die.ACTIVE_ON_TABLE, 1));
	}
	this.totalPriorRollsScore = 0;
	this.rollScore = 0;
	this.rollNumber = 0;
	this.roll(); // Note, ignoring the return value.
};


rh.dwf.DiceRound.prototype.pressedButtonAtLocation = function(location, onTable) {
	activeDie = this.dice[location];
	if (onTable) {
		if (this.dice[location].state == rh.dwf.Die.ACTIVE_ON_TABLE) {
		  // Move this die off the table.
		  activeDie.state = rh.dwf.Die.ACTIVE_OFF_TABLE;
		  // Move other dice off the table too if appropriate.
		  for (var i = 0; i < activeDie.otherLocationsToMoveOffTable.length; ++i) {
			  dependentDieLocation = activeDie.otherLocationsToMoveOffTable[i];
			  this.dice[dependentDieLocation].state = rh.dwf.Die.ACTIVE_OFF_TABLE;
		  }
		}
	} else {
		if (this.dice[location].state == rh.dwf.Die.ACTIVE_OFF_TABLE) {
		  this.dice[location].state = rh.dwf.Die.ACTIVE_ON_TABLE;
		  // Move other dice back onto the table if appropriate.
		  for (var i = 0; i < activeDie.otherLocationsToMoveOffTable.length; ++i) {
			  dependentDieLocation = activeDie.otherLocationsToMoveOffTable[i];
			  dependentDie = this.dice[dependentDieLocation];
			  if (!(dependentDie.value == 1 || dependentDie.value == 5)) {
				  dependentDie.state = rh.dwf.Die.ACTIVE_ON_TABLE;
			  }
		  }
		}
	}
	this._updateCurrentRollScore();
	return activeDie; // Return the die at this location (which probably just moved).
};


rh.dwf.DiceRound.prototype.getRoundScore = function() {
	if (this.isRoundOver()) {
		return 0;
	}
	return this.totalPriorRollsScore + this.rollScore;
};


rh.dwf.DiceRound.prototype.isRoundOver = function() {
	return this._numberOfDiceWithState(rh.dwf.Die.ACTIVE_OFF_TABLE, rh.dwf.Die.ACTIVE_ON_TABLE) == 0;
};


rh.dwf.DiceRound.prototype.hasRemovedAnActiveDie = function() {
	return this._numberOfDiceWithState(rh.dwf.Die.ACTIVE_OFF_TABLE) > 0;
};


/*
 * Returns true if the roll has active dice available to click.
 * Returns false if the roll was a bust.
 */
rh.dwf.DiceRound.prototype.roll = function() {
	if (this.isRoundOver()) {
		return; // Went bust last roll.
	}
	this._updatePriorRollsScore();
	// Check for a six dice reload.
	if (this._numberOfDiceWithState(rh.dwf.Die.ACTIVE_ON_TABLE, rh.dwf.Die.INACTIVE_ON_TABLE) == 0) {
		for (var i = 0; i < 6; ++i) {
			this.dice[i].state = rh.dwf.Die.INACTIVE_ON_TABLE;
		}
	}
	this.rollNumber++;
	for (var i = 0; i < 6; ++i) {
		this.dice[i].roll(); // Handles off table dice as well.
	}
	// Good place for testing.
//	this.dice[0].value = 2;
//	this.dice[1].value = 2;
//	this.dice[2].value = 2;
//	this.dice[3].value = 4;
//	this.dice[4].value = 4;
//	this.dice[5].value = 4;

	this._updateTableDiceMetadata();
	return this._numberOfDiceWithState(rh.dwf.Die.ACTIVE_ON_TABLE) > 0;
};


rh.dwf.DiceRound.prototype.getDice = function() {
	return this.dice;
};


rh.dwf.DiceRound.prototype.getDieAtLocation = function(location) {
	return this.dice[location];
};


// -------------------- Private helper methods ------------------------------

rh.dwf.DiceRound.prototype._numberOfDiceWithState = function(state1, state2) {
	numberOfDice = 0;
	for (var i = 0; i < 6; ++i) {
		if (this.dice[i].state == state1 || this.dice[i].state == state2) {
			numberOfDice++;
		}
	}
	return numberOfDice;
};


/* Return the number of unique values in an array. */
rh.dwf.DiceRound.prototype._numberOfUniqueValues = function(diceValues) {
	uniqueValues = [];
	for (var i = 0; i < diceValues.length; ++i) {
		if ($.inArray(valuesOnTable[i], uniqueValues) == -1) {
			uniqueValues.push(valuesOnTable[i]);
		}
	}
	return uniqueValues.length;
};


rh.dwf.DiceRound.prototype._containsLargeStraight = function(diceValues) {
	return diceValues.length == 6 && this._numberOfUniqueValues(diceValues) == 6;
};


rh.dwf.DiceRound.prototype._containsSixOfAKind = function(diceValues) {
	return diceValues.length == 6 && this._numberOfUniqueValues(diceValues) == 1;
};


rh.dwf.DiceRound.prototype._containsThreeOfAKind = function(diceValues, valueToCheck) {
	numberOfDiceMatchingValue = 0;
	for (var i = 0; i < diceValues.length; ++i) {
		if (diceValues[i] == valueToCheck) {
			numberOfDiceMatchingValue++;
		}
	}
	return numberOfDiceMatchingValue >= 3;
};


rh.dwf.DiceRound.prototype._pointsForThreeOfAKind = function(value) {
	if (value == 1) {
		return 1000;
	}
	return value * 100;
};


rh.dwf.DiceRound.prototype._updateCurrentRollScore = function() {
	this.rollScore = this._scoreForActiveOffTableValues();
};


rh.dwf.DiceRound.prototype._updatePriorRollsScore = function() {
	this.rollScore = 0;
	this.totalPriorRollsScore += this._scoreForActiveOffTableValues();
};


/* Look at only the ACTIVE_OFF_TABLE dice to score them. */
rh.dwf.DiceRound.prototype._scoreForActiveOffTableValues = function() {
	activeOffTableValues = [];
	for (var i = 0; i < 6; ++i) {
		if (this.dice[i].state == rh.dwf.Die.ACTIVE_OFF_TABLE) {
			activeOffTableValues.push(this.dice[i].value);
		}
	}

	// Special case 6 dice combos
	if (activeOffTableValues.length == 6) {
		if (this._containsLargeStraight(activeOffTableValues)) {
			return 1500;
		} else if (this._containsSixOfAKind(valuesOnTable)) {
			return 2 * this._pointsForThreeOfAKind(activeOffTableValues[0]);
		}
	}
	score = 0; // Start accumulator at 0.

	// Look for three of a kinds
	for (var valueToCheck = 1; valueToCheck <= 6; ++valueToCheck) {
		if (this._containsThreeOfAKind(activeOffTableValues, valueToCheck)) {
			score += this._pointsForThreeOfAKind(valueToCheck);
			if (valueToCheck == 5) {
				score -= 150; // For simplicity each 5 will blindly add 50 later.
			} else if (valueToCheck == 1) {
				score -= 300; // For simplicity each 1 will blindly add 100 later.
			}
		}
	}

	// Add 1s and 5s
	for (var i = 0; i < activeOffTableValues.length; ++i) {
		if (activeOffTableValues[i] == 1) {
			score += 100;
		} else if (activeOffTableValues[i] == 5) {
			score += 50;
		}
	}
	return score;
};


/* All dice on the table are INACTIVE prior to this function (none are ACTIVE yet). */
rh.dwf.DiceRound.prototype._updateTableDiceMetadata = function() {
	valuesOnTable = [];
	for (var i = 0; i < 6; ++i) {
		if (this.dice[i].state == rh.dwf.Die.INACTIVE_ON_TABLE) {
			valuesOnTable.push(this.dice[i].value);
		}
	}
	// Special case 6 dice combos
	if (valuesOnTable.length == 6) {
		if (this._containsLargeStraight(valuesOnTable)) {
			this._labelLargeStraight();
			return; // If there is a large straight just stop here.
		} else if (this._containsSixOfAKind(valuesOnTable)) {
			this._labelSixOfAKind();
			return; // If there is a six of a kind just stop here.
		}
	}

	// Look for three of a kinds
	for (var valueToCheck = 1; valueToCheck <= 6; ++valueToCheck) {
		if (this._containsThreeOfAKind(valuesOnTable, valueToCheck)) {
			this._labelThreeOfAKind(valueToCheck);
		}
	}

	// Label 1s and 5s
	this._labelOnesAndFives();
};

rh.dwf.DiceRound.prototype._labelLargeStraight = function() {
	for (var i = 0; i < 6; ++i) {
		currentDie = this.dice[i];
		currentDie.state = rh.dwf.Die.ACTIVE_ON_TABLE;
		currentDie.otherLocationsToMoveOffTable = [0, 1, 2, 3, 4, 5];
		currentDie.otherLocationsToMoveOffTable.splice( $.inArray(i, currentDie.otherLocationsToMoveOffTable), 1 );
	}
};

rh.dwf.DiceRound.prototype._labelSixOfAKind = function() {
	for (var i = 0; i < 3; ++i) {
		currentDie = this.dice[i];
		currentDie.state = rh.dwf.Die.ACTIVE_ON_TABLE;
		currentDie.otherLocationsToMoveOffTable = [0, 1, 2];
		currentDie.otherLocationsToMoveOffTable.splice( $.inArray(i, currentDie.otherLocationsToMoveOffTable), 1 );
	}
	for (var i = 3; i < 6; ++i) {
		currentDie = this.dice[i];
		currentDie.state = rh.dwf.Die.ACTIVE_ON_TABLE;
		currentDie.otherLocationsToMoveOffTable = [3, 4, 5];
		currentDie.otherLocationsToMoveOffTable.splice( $.inArray(i, currentDie.otherLocationsToMoveOffTable), 1 );
	}
};

rh.dwf.DiceRound.prototype._labelThreeOfAKind = function(value) {
	// Find THE three dice locations that we'll use for this three of a kind.
	dieLocationUsedInThreeOfAKind = [];
	for (var location = 0; location < 6; ++location) {
		currentDie = this.dice[location];
		if (currentDie.state == rh.dwf.Die.ACTIVE_ON_TABLE || currentDie.state == rh.dwf.Die.INACTIVE_ON_TABLE) {
			if (currentDie.value == value) {
				dieLocationUsedInThreeOfAKind.push(location);
				currentDie.state = rh.dwf.Die.ACTIVE_ON_TABLE;
				if (dieLocationUsedInThreeOfAKind.length == 3) {
					break; // In case of four of a kind.
				}
			}
		}
	}
	// Mark the otherLocationsToMoveOffTable fields.
	this.dice[dieLocationUsedInThreeOfAKind[0]].otherLocationsToMoveOffTable.push(dieLocationUsedInThreeOfAKind[1]);
	this.dice[dieLocationUsedInThreeOfAKind[0]].otherLocationsToMoveOffTable.push(dieLocationUsedInThreeOfAKind[2]);
	this.dice[dieLocationUsedInThreeOfAKind[1]].otherLocationsToMoveOffTable.push(dieLocationUsedInThreeOfAKind[0]);
	this.dice[dieLocationUsedInThreeOfAKind[1]].otherLocationsToMoveOffTable.push(dieLocationUsedInThreeOfAKind[2]);
	this.dice[dieLocationUsedInThreeOfAKind[2]].otherLocationsToMoveOffTable.push(dieLocationUsedInThreeOfAKind[0]);
	this.dice[dieLocationUsedInThreeOfAKind[2]].otherLocationsToMoveOffTable.push(dieLocationUsedInThreeOfAKind[1]);
};

rh.dwf.DiceRound.prototype._labelOnesAndFives = function(value) {
	for (var i = 0; i < 6; ++i) {
		currentDie = this.dice[i];
		if (currentDie.state == rh.dwf.Die.ACTIVE_ON_TABLE || currentDie.state == rh.dwf.Die.INACTIVE_ON_TABLE) {
			if (currentDie.value == 1 || currentDie.value == 5) {
				currentDie.state = rh.dwf.Die.ACTIVE_ON_TABLE;
			}
		}
	}
};
