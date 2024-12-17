import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class StrategyState {
  @PrimaryColumn({ unique: true, nullable: false })
  id: string;

  @Column()
  name: string;

  @Column('text')
  value: string;

  @Column({ nullable: true })
  timestamp: number;
}
