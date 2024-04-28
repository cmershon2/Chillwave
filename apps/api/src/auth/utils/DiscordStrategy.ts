import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-discord";

export class DiscordStrategy extends PassportStrategy(Strategy) {

    constructor() {
        let scopes = ['identify', 'email'];

        super({
            clientID: process.env.OAUTH_DISCORD_CLIENT_ID,
            clientSecret: process.env.OAUTH_DISCORD_CLIENT_SECRET,
            callbackURL: 'callbackURL',
            scope: scopes
        });
    }
}