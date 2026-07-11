import { Injectable } from '@angular/core';
import { CostCenterStatus, MasterManagementCostCenterItem } from './cost-center.model';

@Injectable({ providedIn: 'root' })
export class MasterManagementCostCenterService {
  readonly departmentMaster: { id: string; name: string }[] = [
    { id: 'DEP-OPS', name: 'Operations' },
    { id: 'DEP-MNT', name: 'Maintenance' },
    { id: 'DEP-IT', name: 'IT' },
    { id: 'DEP-FIN', name: 'Finance' },
    { id: 'DEP-HR', name: 'HR' },
    { id: 'DEP-FAC', name: 'Facilities' }
  ];

  readonly managerMaster: string[] = ['Rajesh Kumar', 'Priya Sharma', 'Arun Nair', 'Sneha Reddy'];

  readonly statusMaster: CostCenterStatus[] = ['Active', 'Inactive'];

  private readonly records: MasterManagementCostCenterItem[] = [
    {
      costCenterId: 'CC-1001',
      costCenterName: 'Plant Operations',
      costCenterCode: 'CC-OPS-01',
      description: 'Covers day-to-day plant operating expenses',
      departmentId: 'DEP-OPS',
      parentCostCenterId: '',
      manager: 'Rajesh Kumar',
      budgetAmount: 250000,
      status: 'Active'
    },
    {
      costCenterId: 'CC-1002',
      costCenterName: 'Maintenance Workshop',
      costCenterCode: 'CC-MNT-01',
      description: 'Covers workshop maintenance labor and spare parts',
      departmentId: 'DEP-MNT',
      parentCostCenterId: 'CC-1001',
      manager: 'Priya Sharma',
      budgetAmount: 180000,
      status: 'Active'
    },
    {
      costCenterId: 'CC-1003',
      costCenterName: 'IT Infrastructure',
      costCenterCode: 'CC-IT-01',
      description: 'Covers IT infrastructure and support costs',
      departmentId: 'DEP-IT',
      parentCostCenterId: '',
      manager: 'Arun Nair',
      budgetAmount: 90000,
      status: 'Active'
    },
    {
      costCenterId: 'CC-1004',
      costCenterName: 'Finance & Accounts',
      costCenterCode: 'CC-FIN-01',
      description: 'Covers finance and accounts department overhead',
      departmentId: 'DEP-FIN',
      parentCostCenterId: '',
      manager: 'Sneha Reddy',
      budgetAmount: 120000,
      status: 'Inactive'
    }
  ];

  private nextSequence = 1005;

  getRecords(): MasterManagementCostCenterItem[] {
    return this.records;
  }

  addRecord(record: MasterManagementCostCenterItem): MasterManagementCostCenterItem {
    const costCenterId = record.costCenterId?.trim() || `CC-${this.nextSequence++}`;
    const created: MasterManagementCostCenterItem = { ...record, costCenterId };
    this.records.push(created);
    return created;
  }

  updateRecord(costCenterId: string, changes: MasterManagementCostCenterItem): void {
    const index = this.records.findIndex((r) => r.costCenterId === costCenterId);
    if (index !== -1) {
      this.records[index] = { ...this.records[index], ...changes };
    }
  }

  deleteRecords(costCenterIds: string[]): void {
    for (const id of costCenterIds) {
      const index = this.records.findIndex((r) => r.costCenterId === id);
      if (index !== -1) {
        this.records.splice(index, 1);
      }
    }
  }

  search(term: string): MasterManagementCostCenterItem[] {
    const value = term.trim().toLowerCase();
    if (!value) return this.records;
    return this.records.filter((r) =>
      Object.values(r).some((v) => String(v).toLowerCase().includes(value))
    );
  }
}
