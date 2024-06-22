import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const contractor = await prisma.contractor.findUnique({
        where: { id: String(id) },
      });
      if (contractor) {
        res.status(200).json(contractor);
      } else {
        res.status(404).json({ error: 'Contractor not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch contractor' });
    }
  } else if (req.method === 'PUT') {
    const { firstName, lastName, company, email, phone, zipCodes, stripeId } = req.body;
    try {
      const contractor = await prisma.contractor.update({
        where: { id: String(id) },
        data: { firstName, lastName, company, email, phone, zipCodes, stripeId },
      });
      res.status(200).json(contractor);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update contractor' });
    }
  } else if (req.method === 'DELETE') {
    try {
      await prisma.contractor.delete({
        where: { id: String(id) },
      });
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete contractor' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
