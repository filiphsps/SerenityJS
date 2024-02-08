import { DisconnectReason, ModalFormResponse, ModalFormCanceledReason, FormType } from '@serenityjs/bedrock-protocol';
import type { NetworkSession } from '../Session';
import { NetworkHandler } from './NetworkHandler';

class ModalFormResponseHandler extends NetworkHandler {
	/**
	 * The packet of the network handler.
	 */
	public static override packet = ModalFormResponse.ID;

	public static override async handle(packet: ModalFormResponse, session: NetworkSession): Promise<void> {
		// Get the player from the session.
		// And check if the player is null or undefined.
		const player = session.getPlayerInstance();

		// Disconnect the player if they are null or undefined.
		if (!player) return session.disconnect('Failed to get player instance.', DisconnectReason.MissingClient);

		// Check if the player has the form.
		if (!player.forms.has(packet.id)) {
			return this.serenity.logger.error(`Player ${player.username} does not have a form with the id ${packet.id}`);
		}

		// Get the form from the player's forms.
		const { resolve, reject, type } = player.forms.get(packet.id)!;

		// Check if the form was canceled.
		if (packet.canceled) {
			return reject(new Error(`Form was canceled by the player. Reason: ${ModalFormCanceledReason[packet.reason!]}`));
		}

		// Parse the json data.
		const parsed = JSON.parse(packet.data!);

		// Switch the form type.
		switch (type) {
			default: {
				break;
			}

			case FormType.Message: {
				const selection = (parsed as boolean) === true ? 0 : 1;

				return resolve({ selection });
			}

			case FormType.Action: {
				const selection = parsed as number;

				return resolve({ selection });
			}
		}
	}
}

export { ModalFormResponseHandler };
