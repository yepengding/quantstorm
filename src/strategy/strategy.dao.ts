import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class StrategyState {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('text')
  value: string;

  @Column({ default: Date.now() })
  timestamp: number;
}
