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

		this.incidentInterval = null;
		this.shieldOn = false; //check if the sheild is on
	}

	startIncident() {
		//start random incident
		setTimeout(() => {
			this.incidentInterval = setInterval(() => {
				this.randomIncident();
			}, this.getRandomInterval());
		}, 10000);
	}

	getRandomInterval() {
		return Math.floor(Math.random() * (18000 - 11000) + 11000);
	}

	randomIncident() {
		const incidentNames = Object.keys(this.incidents);
		if (incidentNames.length === 0) {
			return;
		}

		const randomIndex = Math.floor(Math.random() * incidentNames.length);
		const incident = incidentNames[randomIndex];

		this.activateIncident(incident);
	}

	update() {
		// Update all events to ensure they are using the latest game references
		for (const incidentName in this.incidents) {
			this.incidents[incidentName].game = this.game;
		}

		if (this.game.player?.gameManager?.isGameOver) {
			this.stopAllIncidents();
			return;
		}

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
		if (this.shieldOn) {
			return;
		}
		const incident = this.incidents[incidentName];
		if (incident && !this.activeIncidents.includes(incident)) {
			incident.game = this.game;

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
		this.shieldOn = true;
		this.activeIncidents.forEach(incident => incident.pause());
	}

	resumePausedIncidents() {
		this.shieldOn = false;
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

	stopAllIncidents() {
		if (this.incidentInterval) {
			clearInterval(this.incidentInterval);
		}

		// Deactivate any active incidents
		this.activeIncidents.forEach(incident => {
			if (incident && incident.name) {
				this.deactivateIncident(incident.name);
			}
		});

		this.activeIncidents = [];
	}

	reset() {
		this.stopAllIncidents(); // ← limpia incidentes activos e intervalos

		// Reset flags
		this.isWarning = false;
		this.warningStartTime = 0;
		this.pendingIncident = null;
		this.shieldOn = false;

		// Re-iniciar si quieres que empiece de nuevo inmediatamente:
		this.startIncident(); // ← Solo si deseas reiniciar automáticamente
	}
}
