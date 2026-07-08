import { SchoolsService } from './schools.service';

describe('SchoolsService school code generation', () => {
  it('creates a readable school code from the school name when no code is supplied', async () => {
    const save = jest.fn().mockResolvedValue({});
    const SchoolModelCtor = jest.fn(function (this: any, data: any) {
      this.data = data;
      this.save = save;
    }) as any;

    SchoolModelCtor.findOne = jest.fn().mockReturnValue({
      lean: jest.fn().mockResolvedValue(null),
    });

    const service = new SchoolsService(SchoolModelCtor as any);

    const code = (service as any).generateSchoolCode();

    expect(code).toMatch(/^SCH-[A-Z0-9]{4,6}$/i);
  });
});
