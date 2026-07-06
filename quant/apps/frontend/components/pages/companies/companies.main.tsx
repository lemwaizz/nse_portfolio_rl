import CompaniesHeader from "./companies.header";
import CompaniesTable from "./companies_list_table/companies_table.main";

const CompaniesMainComponent = () => {
  return (
    <div className="w-full xl:max-w-6xl lg:max-w-4xl mx-auto 2xl:max-w-7xl">
      <CompaniesHeader />
      <CompaniesTable />
    </div>
  );
};

export default CompaniesMainComponent;
