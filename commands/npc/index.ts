import PacketWriter from "dimensions/packets/packetwriter";
import PacketTypes from "dimensions/packettypes";
import Npcs from "../../";
import Client from "../../../../client";
import Command from "../../../../command";
import CommandHandler from "../../../../commandhandler";
import CommandHandlers from "../../../../commandhandlers";

class NpcCommand extends CommandHandler {
    public name = "npc";
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
