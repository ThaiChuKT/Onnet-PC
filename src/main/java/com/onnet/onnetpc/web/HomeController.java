package com.onnet.onnetpc.web;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HomeController {

    @GetMapping("/")
        public ResponseEntity<String> home() {
                String html = """
                        <!doctype html>
                        <html lang="en">
                            <head>
                                <meta charset="utf-8" />
                                <meta name="viewport" content="width=device-width, initial-scale=1" />
                                <title>Onnet-PC</title>
                                <style>
                                    body { font-family: Arial, sans-serif; background: #111; color: #eaeaea; margin: 0; min-height: 100vh; display: grid; place-items: center; }
                                    .card { max-width: 720px; padding: 32px; border: 1px solid #2f2f2f; border-radius: 16px; background: #181818; box-shadow: 0 10px 30px rgba(0,0,0,.25); }
                                    h1 { margin: 0 0 12px; font-size: 2rem; }
                                    p { line-height: 1.6; color: #c9c9c9; }
                                    code { background: #222; padding: 2px 6px; border-radius: 6px; }
                                </style>
                            </head>
                            <body>
                                <div class="card">
                                    <h1>Onnet-PC API is running</h1>
                                    <p>This service is deployed and connected to its database. Use the API endpoints under <code>/api/v1</code> or the health check at <code>/actuator/health</code>.</p>
                                </div>
                            </body>
                        </html>
                        """;

                return ResponseEntity.ok()
                        .contentType(MediaType.TEXT_HTML)
                        .body(html);
    }
}