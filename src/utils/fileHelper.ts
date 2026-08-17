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

  static async deleteLines(numberOfLineToDelete: number) {
    try {
      const currentContent = await RNFS.readFile(FILE_PATH, 'utf8');

      const lines = currentContent.split(SEPARATOR);
      lines.splice(0, numberOfLineToDelete);
      const newContent = lines.join(SEPARATOR);

      await RNFS.writeFile(FILE_PATH, newContent, 'utf8');
      EALog.debug('Deleted ' + numberOfLineToDelete + " lines.");
    } catch (error) {
      EALog.error('Unable to delete lines');
    }
  }

  static async appendLine(newLine: string) {
    try {
      await RNFS.appendFile(FILE_PATH, newLine.concat(SEPARATOR), 'utf8');
      EALog.debug('Line appended to the stored properties.');
    } catch (error) {
      EALog.error('Unable to append line: ' + error);
    }
  }

}

export default FileHelper;