import { serveDir } from "jsr:@std/http/file-server";

let previousWord = "しりとり";

Deno.serve(async (_req) => {
    const pathname = new URL(_req.url).pathname;
    console.log(`pathname: ${pathname}`);

    if (_req.method === "GET" && pathname === "/shiritori") {
        return new Response(previousWord);
    }

    if (_req.method === "POST" && pathname === "/shiritori") {
        const requestJson = await _req.json();
        const nextWord = requestJson["nextWord"];

        if (nextWord.length < 2) {
            return new Response(
                JSON.stringify({
                    "errorMessage": "単語は2語以上である必要があります",
                    "errorCode": "10000",
                }),
                {
                    status: 400,
                    headers: { "Content-Tyoe": "application/json" },
                },
            );
        }
        if (previousWord.slice(-1) === nextWord.slice(0, 1)) {
            if (nextWord.slice(-1) === "ん") {
                return new Response(
                    JSON.stringify({
                        "errorMessage": "「ん」で終わる単語は使用できません",
                        "errorCode": "10001",
                    }),
                    {
                        status: 400,
                        headers: { "Content-Type": "application/json" },
                    },
                );
            } else {
                previousWord = nextWord;
                return new Response(previousWord);
            }
        } else {
            return new Response(
                JSON.stringify({
                    "errorMessage": "前の単語に続いていません",
                    "errorCode": "10002",
                }),
                {
                    status: 400,
                    headers: { "Content-Type": "application/json" },
                },
            );
        }
    }

    return serveDir(
        _req,
        {
            fsRoot: "./public/",
            urlRoot: "",
            enableCors: true,
        },
    );
});
