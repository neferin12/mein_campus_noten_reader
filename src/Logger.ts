import {ILogObject, ILogObjectStringifiable, Logger} from "tslog";
import tracer from "./tracer";
import {formats} from "dd-trace/ext";

class CustomLogger extends Logger {
    private logToDatadog(object:ILogObjectStringifiable) {
        const span = tracer.scope().active();
        if (span) {
            tracer.inject(span.context(), formats.LOG, {
                level: object.logLevel,
                ...object
            });
        }
    }

    silly(...args): ILogObject {
        const o = super.silly(...args);
        this.logToDatadog(o.toJSON());
        return o;
    }

    trace(...args): ILogObject {
        const o = super.trace(...args);
        this.logToDatadog(o.toJSON());
        return o;
    }

    debug(...args): ILogObject {
        const o = super.debug(...args);
        this.logToDatadog(o.toJSON());
        return o;
    }

    info(...args): ILogObject {
        const o = super.info(...args);
        this.logToDatadog(o.toJSON());
        return o;
    }

    warn(...args): ILogObject {
        const o = super.warn(...args);
        this.logToDatadog(o.toJSON());
        return o;
    }

    error(...args): ILogObject {
        const o = super.error(...args);
        this.logToDatadog(o.toJSON());
        return o;
    }

    fatal(...args): ILogObject {
        const o = super.fatal(...args);
        this.logToDatadog(o.toJSON());
        return o;
    }
}


// @ts-ignore
export const log: Logger = new CustomLogger({minLevel: process.env.LOG_LEVEL || "info"});
