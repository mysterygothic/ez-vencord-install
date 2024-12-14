/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { showNotification } from "@api/Notifications";
import { Logger } from "@utils/Logger";
import definePlugin from "@utils/types";

const logger: Logger = new Logger("FakeDeafen", "#7b4af7");

let faking: boolean = false;
let origWS: (data: string | ArrayBufferLike | Blob | ArrayBufferView) => void;


function log(text: string) {
    logger.info(text);
}


function toggleFakeDeafen() {
    if (faking) {
        faking = false;
        WebSocket.prototype.send = origWS;

        showNotification({
            title: "FakeDeafen",
            body: "Fake deafen is now disabled.",
        });
    } else {
        faking = true;

        
        WebSocket.prototype.send = function (data) {
            const dataType = Object.prototype.toString.call(data);

            switch (dataType) {
                case "[object String]":
                    let obj: any;
                    try {
                        obj = JSON.parse(data);
                    } catch {
                       
                        origWS.apply(this, [data]);
                        return;
                    }

                    if (obj.d !== undefined && obj.d.self_deaf !== undefined && obj.d.self_deaf === false) {
                       
                        return;
                    }
                    break;

                case "[object ArrayBuffer]":
                    const decoder = new TextDecoder("utf-8");
                    if (decoder.decode(data).includes("self_deafs\x05false")) {
                        
                        return;
                    }
                    break;
            }

           
            origWS.apply(this, [data]);
        };

        showNotification({
            title: "FakeDeafen",
            body: "Deafening is now faked.",
        });
    }
}

export default definePlugin({
    name: "FakeDeafen",
    description: "Fake deafens you, so you can still hear things.",
    authors: [{ name: "MisleadingName", id: 892072557988151347n }, { name: "Exotic", id: 287667540178501634n }],

    start: () => {
        origWS = WebSocket.prototype.send;
        log("FakeDeafen loaded and ready.");
    },

    stop: () => {
        WebSocket.prototype.send = origWS;
        log("FakeDeafen stopped.");
    },

    toolboxActions: {
        "Toggle FakeDeafen By @gothyo on discord": () => {
            toggleFakeDeafen();
        },
    },
});
