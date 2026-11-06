import mongoose from 'mongoose';
import dns from 'node:dns';

export async function connectDb() {
  const dnsServers = process.env.DNS_SERVERS?.split(',').map(server => server.trim()).filter(Boolean);
  if (dnsServers?.length) dns.setServers(dnsServers);
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB connected');
}
