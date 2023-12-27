import * as RNFS from 'react-native-fs';
import EALog from '../models/eaLog';

const FILENAME = "eulerian.txt";
const FILE_PATH = RNFS.DocumentDirectoryPath + '/' + FILENAME;
const SEPARATOR = "\n";


class FileHelper {

  static async getLines() {
    try {
      const content = await RNFS.readFile(FILE_PATH, 'utf8');
      const lines = content.split(SEPARATOR);
      const res = lines.filter((line) => line.trim() !== '');
      return res;
    } catch (error) {
      console.error('Errore nella lettura:', error);
      return [];
    }
  }

  static deleteLines(numberOfLineToDelete: number) {
    RNFS.readFile(FILE_PATH, 'utf8')
      .then((currentContent) => {

        const lines = currentContent.split(SEPARATOR);
        lines.splice(0, numberOfLineToDelete);
        const newContent = lines.join(SEPARATOR);

        return RNFS.writeFile(FILE_PATH, newContent, 'utf8');
      })
      .then(() => {
        EALog.debug('Deleted ' + numberOfLineToDelete + " lines.");
      })
      .catch((error) => {
        EALog.error('Unable to delete lines');
      });
  }

  static appendLine(newLine: string) {
    RNFS.writeFile(FILE_PATH, newLine.concat(SEPARATOR), 'utf8')
      .then((success) => {
        console.log('FILE WRITTEN!');
      })
      .catch((err) => {
        console.log(err.message);
      });
  }

}

export default FileHelper;