import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class StrategyState {
  @PrimaryColumn({ unique: true, nullable: false })
  id: string;

  @Column('text')
  value: string;

  @Column({ default: Date.now() })
  timestamp: number;
}
