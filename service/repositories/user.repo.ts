import { Repository } from 'typeorm';
import { User } from '../models/user.entity';

export class UserRepository extends Repository<User> {
  async findByWalletAddress(walletAddress: string): Promise<User | null> {
    return this.findOne({ where: { walletAddress: walletAddress.toLowerCase() } });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.findOne({ where: { username } });
  }

  async findById(userId: string): Promise<User | null> {
    return this.findOne({ where: { id: userId } });
  }

  async createOrUpdateFromWallet(walletAddress: string): Promise<User> {
    let user = await this.findByWalletAddress(walletAddress);
    if (!user) {
      user = this.create({ walletAddress: walletAddress.toLowerCase() });
    }
    return this.save(user);
  }
}
