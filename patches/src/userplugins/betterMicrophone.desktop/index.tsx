import { PluginAuthor, PluginDef } from "@utils/types";
import { Emitter } from "../philsPluginLibrary";
import { PluginInfo } from "./constants";
import { openMicrophoneSettingsModal } from "./modals";
import { MicrophonePatcher } from "./patchers";
import { initMicrophoneStore } from "./stores";

export default new class Plugin implements PluginDef {
    readonly name: string;
    readonly description: string;
    readonly authors: PluginAuthor[];
    readonly dependencies: string[];

    public microphonePatcher?: MicrophonePatcher;

    // Adding the toolbox 
    toolboxActions: Record<string, () => void>;

    constructor() {
        this.name = PluginInfo.PLUGIN_NAME;
        this.description = PluginInfo.DESCRIPTION;
        this.authors = [PluginInfo.AUTHOR, ...Object.values(PluginInfo.CONTRIBUTORS)] as PluginAuthor[];
        this.dependencies = ["PhilsPluginLibrary"];

        // actions for the toolbox 
        this.toolboxActions = {
            "Open Microphone Settings": openMicrophoneSettingsModal,
            "Toggle Microphone Patcher": this.toggleMicrophonePatcher.bind(this)
        };
    }

    start(): void {
        initMicrophoneStore();

        this.microphonePatcher = new MicrophonePatcher().patch();

        
    }

    stop(): void {
        this.microphonePatcher?.unpatch();

        Emitter.removeAllListeners(PluginInfo.PLUGIN_NAME);
    }

    
    private toggleMicrophonePatcher(): void {
        if (this.microphonePatcher) {
            this.microphonePatcher.unpatch();
            this.microphonePatcher = undefined;
            console.log(`${this.name}: Microphone patcher disabled.`);
        } else {
            this.microphonePatcher = new MicrophonePatcher().patch();
            console.log(`${this.name}: Microphone patcher enabled.`);
        }
    }
};
