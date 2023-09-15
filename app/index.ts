import * as fs from "fs";
import Client from "terrariaserver-lite/client";
import TerrariaServer from "terrariaserver-lite/terrariaserver";
import Extension from "terrariaserver-lite/extensions/extension";
import NpcCommand from "./commands/npc";

import * as NpcUpdate from "@darkgaming/rescript-terrariapacket/src/packet/Packet_NpcUpdate.gen";

interface Npc {
    netId: number;
    x: number;
    y: number;
}

class Npcs extends Extension {
    public name = "Npcs";
    public directory = `${process.cwd()}/persistence/npcs.json`;
    public version = "v1.0";
    public path = "";
    private _npcs: Npc[] = [];

    constructor(server: TerrariaServer) {
        super(server);
        this.loadNpcs();
        this.addCommand(new NpcCommand(this, this.server.commandHandler))
    }

    public addNpc(npc: Npc): void {
        this._npcs.push(npc);
        this.saveNpcs();

        const index = this._npcs.length - 1;
        for (const client of this.server.clients) {
            this.syncNpc(client, index);
        }
    }

    public handleClientConnect?(client: Client): void {
        this.syncNpcs(client);
    }

    private syncNpcs(client: Client): void {
        for (let i = 0; i < this._npcs.length; i++) {
            this.syncNpc(client, i);
        }
    }

    private syncNpc(client: Client, index: number): void {
        const npcUpdate = NpcUpdate.toBuffer({
            npcSlotId: index,
            npcTypeId: this._npcs[index].netId,
            x: this._npcs[index].x,
            y: this._npcs[index].y,
            vx: 0,
            vy: 0,
            target: 255,
            directionX: false,
            directionY: false,
            ai: [undefined, undefined, undefined, undefined],
            spriteDirection: false,
            life: "Max",
            releaseOwner: undefined,
            playerCountScale: undefined,
            strengthMultiplier: undefined,
            spawnedFromStatue: false
        });
        client.sendPacket(npcUpdate);
    }

    private async npcsFileExists(): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            fs.exists(this.directory, (exists) => {
                resolve(exists);
            });
        });
    }

    private async loadNpcs(): Promise<void> {
        if (await this.npcsFileExists()) {
            this.loadNpcsFromFile();
        }
    }

    private async loadNpcsFromFile(): Promise<void> {
        const fileContents = await this.readNpcsFile();
        try {
            this._npcs = JSON.parse(fileContents);
        } catch (e) {
            console.log("NPCs could not be loaded from file.");
        }
    }

    private readNpcsFile(): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            fs.readFile(this.directory, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data.toString());
                }
            });
        });
    }

    private saveNpcs(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            fs.writeFile(this.directory, JSON.stringify(this._npcs), (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }
}

export default Npcs;
