package ru.scircus.mech

/**
 * Created by IntelliJ IDEA.
 * User: svkior
 * Date: 25.09.11
 * Time: 18:44
 * To change this template use File | Settings | File Templates.
 */

import org.apache.commons.net.ftp.FTPClient

class GetFTPTelemetry {
    static final FTPClient ftp = new FTPClient()
    String server

    List sysCyc
    List sensVal
    List trgenVal
    List regVal
    List encoder

    GetFTPTelemetry(String serverName){
        server = serverName
    }

    def updateTelemetry(def driveNum, def busNum, def motNum){
        println "Creating necessary directories "

        File f = new File("./working/$server/test");
        f.mkdirs();

        def file = new File("./working/${server}/test/drive_${driveNum}_${busNum}_${motNum}")
        try {
            file.delete()
        } catch(Error e) {
            println "File not found"
        }

        println "Connecting to server"
        println "Connecting to server ${ftp.connect(server)}"
        println "Login to server ${ftp.login('svkior','foroveran')}" // ToDo: insert login and password for user
        println ftp.getReplyString()

        println "Change mode to passive ${ftp.enterLocalPassiveMode()}"
        println ftp.getReplyString()

        println "CMD ${ftp.changeWorkingDirectory( '/mnt/telemetry')}" // ToDo: insert true Directory
        println ftp.getReplyString()

        def ftpFileName = "drive_${driveNum}_${busNum}_${motNum}"

        println "Filename ${ftpFileName}"

        file.withOutputStream{ os ->
            print "RETR ${ftp.retrieveFile( ftpFileName, os )}"
            println ftp.getReplyString()
        }
        ftp.deleteFile(ftpFileName)
        println ftp.getReplyString()

        ftp.logout()
        ftp.disconnect()
    }

    def loadTelemetry(def driveNum, def busNum, def motNum){
        List<String> fileContents = new File("./working/$server/test/drive_${driveNum}_${busNum}_${motNum}").text.readLines()

        if(fileContents.size() > 10){

            def skip = 0;

            sysCyc = new double[fileContents.size()-skip]
            sensVal = new double[fileContents.size()-skip]
            trgenVal = new double[fileContents.size()-skip]
            regVal = new double[fileContents.size()-skip]
            encoder = new double[fileContents.size()-skip]

            def idx = 0;
            fileContents.each{
                if(idx >= skip){
                    /*
                    time speed_ust pos_ust enc_abs_pos enc_pos enc_speed position_error final_ust
                    - (0) time - время от начала движения, сек
                    - (1) speed_ust - Уставка по скорости в Си * 10000
                    - (2) pos_ust - Уставка по положению в Си * 100
                    - (3) enc_abs_pos  - значение датчика
                    - (4) enc_pos - Относительное положение по датчику в Си * 100
                    - (5) enc_speed - скорость по датчику в Си * 100
                    - (6) position_error - Ощибка по положению в Си * 100
                    - (7) final_ust - уставка на привод
                     */
                    def splitIt = it.split()
                    sysCyc[idx-skip] = splitIt[0].toDouble()
                    sensVal[idx-skip]  = splitIt[4].toDouble()
                    trgenVal[idx-skip] = splitIt[2].toDouble()
                    regVal[idx-skip]   = splitIt[7].toDouble()
                    encoder[idx-skip] = splitIt[3].toDouble()
                }
                idx++
            }

            println "Length: ${sysCyc.size()}"

        }

    }

}
