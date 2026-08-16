import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lead } from './entities/lead.entity';
import { ChatMessage, ChatSender } from './entities/chat-message.entity';
import { CreateLeadDto, CreateMessageDto, UpdateLeadDto } from './dto/lead.dto';

@Injectable()
export class LeadsService {
  constructor(
    @InjectRepository(Lead)
    private readonly leadRepo: Repository<Lead>,
    @InjectRepository(ChatMessage)
    private readonly messageRepo: Repository<ChatMessage>,
  ) {}

  async createLead(dto: CreateLeadDto): Promise<Lead> {
    const lead = this.leadRepo.create({
      name: dto.name,
      address: dto.address,
      phone: dto.phone,
    });
    return this.leadRepo.save(lead);
  }

  async addGuestMessage(leadId: string, dto: CreateMessageDto): Promise<ChatMessage> {
    await this.ensureLead(leadId);
    const message = this.messageRepo.create({
      lead_id: leadId,
      sender: ChatSender.GUEST,
      body: dto.body,
    });
    return this.messageRepo.save(message);
  }

  async getThread(leadId: string): Promise<Lead & { messages: ChatMessage[] }> {
    const lead = await this.ensureLead(leadId);
    const messages = await this.messageRepo.find({
      where: { lead_id: leadId },
      order: { created_at: 'ASC' },
    });
    return { ...lead, messages };
  }

  async listLeads(): Promise<
    (Lead & { message_count: number; last_message: string | null })[]
  > {
    const leads = await this.leadRepo.find({ order: { created_at: 'DESC' } });
    if (leads.length === 0) return [];

    const threads = await this.messageRepo
      .createQueryBuilder('m')
      .select('m.lead_id', 'lead_id')
      .addSelect('COUNT(*)', 'cnt')
      .addSelect('MAX(m.created_at)', 'last_at')
      .groupBy('m.lead_id')
      .getRawMany<{ lead_id: string; cnt: string; last_at: Date }>();

    const map = new Map(threads.map((t) => [t.lead_id, t]));
    return leads.map((l) => {
      const info = map.get(l.id);
      return {
        ...l,
        message_count: info ? Number(info.cnt) : 0,
        last_message: info ? `Terakhir: ${new Date(info.last_at).toLocaleString('id-ID')}` : null,
      };
    });
  }

  async getLead(id: string) {
    return this.getThread(id);
  }

  async adminReply(leadId: string, dto: CreateMessageDto): Promise<ChatMessage> {
    await this.ensureLead(leadId);
    const message = this.messageRepo.create({
      lead_id: leadId,
      sender: ChatSender.ADMIN,
      body: dto.body,
    });
    return this.messageRepo.save(message);
  }

  async updateLead(id: string, dto: UpdateLeadDto): Promise<Lead> {
    const lead = await this.ensureLead(id);
    if (dto.status != null) lead.status = dto.status;
    if (dto.notes !== undefined) lead.notes = dto.notes;
    return this.leadRepo.save(lead);
  }

  private async ensureLead(id: string): Promise<Lead> {
    const lead = await this.leadRepo.findOne({ where: { id } });
    if (!lead) {
      throw new NotFoundException('Lead tidak ditemukan');
    }
    return lead;
  }
}
