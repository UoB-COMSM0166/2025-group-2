import {
	FireIncident,
	FogIncident,
	FreezeIncident,
	RainIncident,
	WindIncident,
} from '../incidents/index.js';

export class IncidentManager {
	constructor(game, gameArea, endLine) {
		this.game = game;
		this.gameArea = gameArea;
		this.endLine = endLine;

		this.incidents = {
			Wind: new WindIncident(game),
			Fog: new FogIncident(game, gameArea, endLine),
			Freeze: new FreezeIncident(game),
			Fire: new FireIncident(game),
			Rain: new RainIncident(game, gameArea),
		};
		this.activeIncidents = [];
		this.isWarning = false;
		this.warningStartTime = 0;
		this.pendingIncident = null;
	}

	update() {
		if (this.isWarning) {
			let elapsed = millis() - this.warningStartTime;
			if (elapsed < 2000) {
				this.showWarning();
			} else {
				this.isWarning = false;
				if (this.pendingIncident) {
					this.pendingIncident.enable();
					this.activeIncidents.push(this.pendingIncident);
					this.pendingIncident = null;
				}
			}
		}

		this.activeIncidents.forEach(incident => incident.update());
	}

	activateIncident(incidentName) {
		const incident = this.incidents[incidentName];
		if (incident && !this.activeIncidents.includes(incident)) {
			this.isWarning = true;
			this.warningStartTime = millis();
			this.pendingIncident = incident;
			incident.manager = this;
			incident.name = incidentName;

			this.activeIncidents.push(incident);
		}
	}

	deactivateIncident(incidentName) {
		const incident = this.incidents[incidentName];
		if (incident) {
			incident.disable();
			this.activeIncidents = this.activeIncidents.filter(incident => incident !== incident);
		}
	}

	pauseActiveIncidents() {
		this.activeIncidents.forEach(incident => incident.pause());
	}

	resumePausedIncidents() {
		this.activeIncidents.forEach(incident => incident.resume());
	}

	showWarning() {
		push();
		textAlign(CENTER, CENTER);
		textSize(30);
		fill(255, 0, 0);
		text(
			`${this.pendingIncident.name} Incident Coming!`,
			this.gameArea.x + this.gameArea.w / 2,
			this.gameArea.y + this.gameArea.h / 2
		);
		pop();
	}
}
