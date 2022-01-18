const axios = require("axios");
const robotsParser = require("robots-txt-parser");
const fs = require("fs");
const robots = robotsParser({
    userAgent: 'Googlebot', // The default user agent to use when looking for allow/disallow rules, if this agent isn't listed in the active robots.txt, we use *.
    allowOnNeutral: false // The value to use when the robots.txt rule's for allow and disallow are balanced on whether a link can be crawled.
});

const runAudit = async (opts) => {
    let url, output_dir
    const date = new Date()
    const dir_timestamp = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDay() + '_' + date.getTime()
    let audit_dir = process.cwd() + '/audits'
    let result = {
        robotsExists: null,
        sitemapsInRobots: null,
    };
    const init = async () => {
        if ('url' in opts) {
            url = opts.url
        } else {
            return Promise.reject(new Error(`'Url' must be set`))
        }
        if ('audit_dir' in opts) {
            output_dir = opts.audit_dir
        } else {
            output_dir = `${audit_dir}/${url}/${dir_timestamp}`
        }
        await createDirectories();

        url = url.endsWith('/') ? url.slice(0, -1) : url;
    }
    const createDirectories = async () => {
        console.log(`Creating directory ${output_dir}`)
        return fs.promises.mkdir(output_dir, {recursive: true})
    }
    try {
        await init();
        await axios.get(url + "/robots.txt")
            .then((res) => {
                result.robotsExists = true;
            })
            .catch((err) => {
                console.log(err);
                if(err.response) {
                    result.robotsExists = false;
                } else {
                    return Promise.reject(err);
                }
            });
        await robots.useRobotsFor(url)
            .then(() => {
                robots.getSitemaps().then((sitemaps) => {
                    result.sitemapsInRobots = !!sitemaps.length;
                });
            });
        await fs.promises.writeFile(`${output_dir}/robots.json`, JSON.stringify(result))
        return Promise.resolve({report: result, dir: output_dir});
    } catch (err) {
        console.error(err);
    }
}

module.exports = {
    runAudit: runAudit
}