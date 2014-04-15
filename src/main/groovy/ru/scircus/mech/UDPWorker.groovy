package ru.scircus.mech

/**
 * Created by IntelliJ IDEA.
 * User: svkior
 * Date: 25.09.11
 * Time: 21:43
 * To change this template use File | Settings | File Templates.
 */

class UDPWorker {
  def addr
  def port

   UDPWorker(String inetAddr) {
       addr = InetAddress.getByName(inetAddr)
       port = 1350
   }

  def SendPacket(int pktCode,List data) {
      def dataLen = data.size()*4
      println "DataLen : $dataLen"
      def packetLen = dataLen+12
      println "packetLen : $packetLen"
      def buffer = new byte[packetLen]

      // 7 6 5 4
      buffer[7] = (pktCode>>24).byteValue()
      buffer[6] = (pktCode>>16).byteValue()
      buffer[5] = (pktCode>>8).byteValue()
      buffer[4] = (pktCode).byteValue()

      buffer[11] = (dataLen>>24).byteValue()
      buffer[10] = (dataLen>>16).byteValue()
      buffer[9]  = (dataLen>>8).byteValue()
      buffer[8]  = (dataLen).byteValue()

      def idPult = 5

      buffer[3] = (idPult>>24).byteValue()
      buffer[2] = (idPult>>16).byteValue()
      buffer[1] = (idPult>>8).byteValue()
      buffer[0] = (idPult).byteValue()

      def idx = 12
      data.each{
          buffer[idx+3] = (it>>24).byteValue()
          buffer[idx+2] = (it>>16).byteValue()
          buffer[idx+1] = (it>>8).byteValue()
          buffer[idx]   = (it).byteValue()
          idx +=4
      }
//      println "Buffer: $buffer"
//      println "BufferLen: ${buffer.size()}"
      def packet = new DatagramPacket(buffer, buffer.length, addr, port)
      def socket = new DatagramSocket()
      socket.send(packet)
  }
}
