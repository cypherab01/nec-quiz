"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SubjectCreateForm } from "@/components/tabs/SubjectCreateForm";
import { UnitCreateForm } from "@/components/tabs/UnitCreateForm";

const SubjectUnitCreateTabs = () => {
  return (
    <Tabs defaultValue="subject">
      <TabsList>
        <TabsTrigger value="subject">Subject</TabsTrigger>
        <TabsTrigger value="unit">Unit</TabsTrigger>
      </TabsList>
      <TabsContent value="subject">
        <SubjectCreateForm />
      </TabsContent>
      <TabsContent value="unit">
        <UnitCreateForm />
      </TabsContent>
    </Tabs>
  );
};

export default SubjectUnitCreateTabs;
