import * as bcrypt from "bcrypt";
import PacketWriter from "dimensions/packets/packetwriter";
import PacketTypes from "dimensions/packettypes";
import * as fs from "fs";
import * as Winston from "winston";
import ChatMessage from "../../chatmessage";
import Client from "../../client";
import Database from "../../database";
import TerrariaServer from "../../terrariaserver";
import Extension from "../extension";

interface Npc {
    netId: number;
    x: number;
    y: number;
}

class Npcs extends Extension {
    public name = "Npcs";
    public directory = "../persistance/npcs.json";
    public version = "v1.0";
    public path = "";
    private _npcs: Npc[] = [];

    constructor(server: TerrariaServer) {
        super(server);
        this.loadNpcs();
        this.loadCommands(__dirname);
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
        const packet = new PacketWriter().setType(PacketTypes.NPCUpdate)
            .packInt16(index)
            .packSingle(this._npcs[index].x)
            .packSingle(this._npcs[index].y)
            .packSingle(0) // Vel X
            .packSingle(0) // Vel Y
            .packUInt16(255) // Target
            .packByte(128) // Flags
            .packInt16(this._npcs[index].netId) // Npc NetID
            .data;

        const packet2 = new PacketWriter().setType(PacketTypes.UpdateNPCBuff)
            .packInt16(index)
            .packByte(47)
            .packInt16(3000)
            .data;

        client.sendPacket(new Buffer(packet + packet2, "hex"));
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
