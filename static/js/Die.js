
/* Constructor */
rh.dwf.Die = function(location, state, value) {
	this.location = location;
	this.state = rh.dwf.Die.ACTIVE_ON_TABLE;
	this.value = value;
	this.otherLocationsToMoveOffTable = [];
};

/* Constants */
rh.dwf.Die.ACTIVE_ON_TABLE = 3;
rh.dwf.Die.ACTIVE_OFF_TABLE = 2;
rh.dwf.Die.INACTIVE_ON_TABLE = 1;
rh.dwf.Die.INACTIVE_OFF_TABLE = 0;

/* Rolls the die if it is on the table. Leave the state as INACTIVE_ON_TABLE temporarily. */
rh.dwf.Die.prototype.roll = function() {
	if (this.state == rh.dwf.Die.INACTIVE_ON_TABLE || this.state == rh.dwf.Die.ACTIVE_ON_TABLE) {
		this.state = rh.dwf.Die.INACTIVE_ON_TABLE;
		this.value = Math.floor((Math.random() * 6) + 1);
	} else if (this.state == rh.dwf.Die.ACTIVE_OFF_TABLE) {
		this.state = rh.dwf.Die.INACTIVE_OFF_TABLE;
	}
	this.otherLocationsToMoveOffTable = []; // Reset this helper array.
};