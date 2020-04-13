import googleApis from 'googleapis';
import loadJsonFile from 'load-json-file';


const authorize = (jwtClient) => {
    return new Promise(resolve => {
        jwtClient.authorize((err,tokens) => resolve({ err,tokens }));
    });
}


export const getAuthorization = async () => {

    let privatekey = await loadJsonFile("./datalergy-key.json");

    let jwtClient = new googleApis.google.auth.JWT(
        privatekey.client_email,
        null,
        privatekey.private_key,
        ['https://www.googleapis.com/auth/spreadsheets']
    );

    const {err, tokens} = await authorize(jwtClient);

    if (err) console.log(err);
    // else console.log(jwtClient);

    return jwtClient;
}

export const writeToSheet = (values, sheetName, jwtClient) => {

    let sheets = googleApis.google.sheets('v4');
    sheets.spreadsheets.values.append({
        auth: jwtClient,
        spreadsheetId: "1VZ0_CA5onQBhgy-XBSm9LshdU498gPiX0fxHEy6Rme0",
        range: sheetName,
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',
        includeValuesInResponse: true,

        resource: {
            "majorDimension": "COLUMNS",
            "values": values
        }
        }, (err, response) => {
            if (err) console.log(err);
            else console.log(sheetName + ': ' + response.status + ' ' + response.statusText);
    });
}

