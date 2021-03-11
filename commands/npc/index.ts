import Npcs from "../../";
import Client from "terrariaserver-lite/client";
import Command from "terrariaserver-lite/command";
import CommandHandler from "terrariaserver-lite/commandhandler";
import CommandHandlers from "terrariaserver-lite/commandhandlers";

class NpcCommand extends CommandHandler {
    public names = ["npc"];
    public permission = "npc.use";
    private _npcMain: Npcs;

    constructor(npcMain: Npcs, commandHandlers: CommandHandlers) {
        super(commandHandlers);
        this._npcMain = npcMain;
    }

    public handle(command: Command, client: Client): void {
        switch (command.parameters[0]) {
            case "spawn":
                this.handleSpawnNpc({
                    name: "npc spawn",
                    parameters: command.parameters.slice(1)
                }, client);
                break;
            }
    }

    private handleSpawnNpc(command: Command, client: Client): void {
        const netId = parseInt(command.parameters[0]);
        const x = client.player.position.x;
        const y = client.player.position.y;

        this._npcMain.addNpc({
            netId,
            x,
            y
        });
    }
}

export default NpcCommand;
