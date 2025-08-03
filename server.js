import { serveDir } from "jsr:@std/http/file-server";

// 直前の単語を保持
let previousWord = "しりとり";

// localhostにDenoのHTTPサーバーを展開
Deno.serve(async (_req) => {
    const pathname = new URL(_req.url).pathname;
    console.log(`pathname: ${pathname}`);

    if (_req.method === "GET" && pathname === "/shiritori") {
        return new Response(previousWord);
    }

    if (_req.method === "POST" && pathname === "/shiritori") {
        const requestJson = await _req.json();
        const nextWord = requestJson["nextWord"];

        // 単語が2語以上であることの確認
        if (nextWord.length < 2) {
            return new Response(
                JSON.stringify({
                    "errorMessage": "単語は2語以上である必要があります",
                    "errorCode": "10000",
                }),
                {
                    status: 400,
                    headers: { "Content-Type": "application/json" },
                },
            );
        }
        // previousWordの末尾とnextWordの先頭が同一か確認
        if (previousWord.slice(-1) === nextWord.slice(0, 1)) {
            // nextWordの末尾が「ん」であるかどうかの確認
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
                // 問題なければpreviousWordを更新して、現在の単語を返す
            } else {
                previousWord = nextWord;
                return new Response(previousWord);
            }
            // 同一でない単語の入力時にエラーを返す
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

    // HTMLやCSSなどの静的ファイルを配信する設定
    return serveDir(
        _req,
        {
            fsRoot: "./public/", // publicフォルダ内のファイルをルートとして使う
            urlRoot: "", // URLのルートパス(空ならそのまま使う)
            enableCors: true, // CORS(他のドメインからのアクセス)を許可する
        },
    );
});
