import { WindIncident, TestIncident } from '../incidents/index.js';

export class IncidentManager {
	constructor(game) {
		this.game = game;
		this.incidents = {
			wind: new WindIncident(game),
			gravity: new TestIncident(game),
		};
		this.activeIncidents = [];
	}

	update() {
		this.activeIncidents.forEach((incident) => incident.update());
	}

	activateIncident(incidentName) {
		const incident = this.incidents[incidentName];
		if (incident && !this.activeIncidents.includes(incident)) {
			incident.enable();
			this.activeIncidents.push(incident);
		}
	}

	deactivateIncident(incidentName) {
		const incident = this.incidents[incidentName];
		if (incident) {
			incident.disable();
			this.activeIncidents = this.activeIncidents.filter((i) => i !== incident);
		}
	}

	pauseActiveIncidents() {
		this.activeIncidents.forEach((incident) => incident.pause());
	}

	resumePausedIncidents() {
		this.activeIncidents.forEach((incident) => incident.resume());
	}
}
