import { NurseDischargeClearanceForm } from "./nurse-discharge-clearance-form";

export function DischargeClearanceCard({
  hospitalSlug,
  admissionId,
  dischargeRequested
}:{
  hospitalSlug:string
  admissionId:string
  dischargeRequested:boolean
}){

  if(!dischargeRequested){
    return (
      <div className="rounded-xl border p-5 text-sm text-muted-foreground">
        Doctor has not requested discharge yet.
      </div>
    );
  }

  return (
    <NurseDischargeClearanceForm
      hospitalSlug={hospitalSlug}
      admissionId={admissionId}
    />
  );

}