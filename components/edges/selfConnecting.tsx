import React, { useState } from 'react';
import { 
  BaseEdge, 
  BezierEdge, 
  EdgeLabelRenderer, 
  EdgeText, 
  getSmoothStepPath, 
  SmoothStepEdge, 
  type EdgeProps 
} from '@xyflow/react';
import EdgeTransitionCategory from '@/enums/edgeTransitionType';


import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Cog, Trash } from 'lucide-react';

import EdgeInfoModal from '@/components/generic/edgeInfo';
import { createRightToLeftSwoosh } from '@/lib/berizerUtils';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useTheme } from 'next-themes';

interface CustomEdgeProps extends EdgeProps {
  data: {
    deleteEdge: (id: string) => void;
    height: number;
    edgeColor: string;
    modifyEdgeInfo: (values: { [key:string]: any }) => void;
    edgeTransitionCategory: EdgeTransitionCategory,
    edgeAdditionalInfo: any
  }
}


const SelfConnecting = (props: CustomEdgeProps) => {
    // we are using the default bezier edge when source and target ids are different
    // if (props.source !== props.target) {
    //     return <SmoothStepEdge {...props} />;
    // }
    
    const { sourceX, sourceY, targetX, targetY, id, markerEnd, label = '' } = props;
    //const height = 150 + Math.floor(Math.random() * 100);
    
    const x = sourceX;
    const y = sourceY;

    const {sourcePosition, targetPosition} = props;

    let [path, labelX, labelY] = getSmoothStepPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
    });

    if (props.source === props.target) {

      const {bezierPath,midX,midY} = createRightToLeftSwoosh(sourceX,sourceY,targetX,targetY,props.data.height,2);

      path = bezierPath;
      labelX=midX
      labelY=midY
    }

    const isSelected = props.selected
    const edgeAdditionalInfo = props.data.edgeAdditionalInfo;

    const getCurrentTheme = (): 'light' | 'dark' | 'system' | undefined => {
      const { theme } = useTheme();
      if (theme === 'light' || theme === 'dark' || theme === 'system') {
          return theme;
      }
      return 'dark';
    }

    return (
        <>
            <BaseEdge 
              path={path} 
              key={id} 
              markerEnd={markerEnd} 
              label={label} 
              style={{
                strokeWidth: 4,
                stroke: `hsl(${props.data.edgeColor} 100% ${getCurrentTheme() === 'light' ? '40%' : '80%'})`
              }}
            />
            <EdgeLabelRenderer key={`edge_renderer_${id}`}>
              <div
                  style={{
                    transform: `translate(-50%, -100%) translate(${labelX}px,${labelY}px)`,
                  }}
                  className="button-edge__label nodrag nopan absolute"
              >
                <Card>
                  <CardContent className='p-2'>
                    <Label className='mb-2'>{label}</Label>
                    <div className="flex flex-col items-center gap-2">
                      {
                        (isSelected) ? 
                        (
                          <div className='flex gap-2'>
                            <Button variant={'outline'} style={{ pointerEvents: 'auto'}} onClick={
                              () => {
                                if(props && props.data && props.data.deleteEdge){
                                  props.data.deleteEdge(props.id);
                                }
                              }
                            }>
                              <Trash/>
                            </Button>
                            <EdgeInfoModal 
                              edgeInfoDefaultValues={{
                                
                                //generic
                                edgeLabel:label?.toString() || "",

                                //job
                                isJobActive: edgeAdditionalInfo.isJobActive ? edgeAdditionalInfo.isJobActive : undefined,
                                jobScript: edgeAdditionalInfo.jobScript ? edgeAdditionalInfo.jobScript.toString() : undefined,
                                jobStartDelay: edgeAdditionalInfo.jobStartDelay ? edgeAdditionalInfo.jobStartDelay.toString() : undefined,
                                jobStartDelayUnit: edgeAdditionalInfo.jobStartDelayUnit ? edgeAdditionalInfo.jobStartDelayUnit.toString() : undefined,
                                jobFreqency: edgeAdditionalInfo.jobFreqency ? edgeAdditionalInfo.jobFreqency.toString() : undefined,
                                jobRepeatationCount: edgeAdditionalInfo.jobRepeatationCount ? edgeAdditionalInfo.jobRepeatationCount.toString() : undefined,
                                jobRepeatationDelay: edgeAdditionalInfo.jobRepeatationDelay ? edgeAdditionalInfo.jobRepeatationDelay.toString() : undefined,
                                jobRepeatationUnit: edgeAdditionalInfo.jobRepeatationUnit ? edgeAdditionalInfo.jobRepeatationUnit.toString() : undefined,

                                // action
                                actionValidatationScript: edgeAdditionalInfo.actionValidatationScript ? edgeAdditionalInfo.actionValidatationScript.toString() : undefined,
                                transitionScript: edgeAdditionalInfo.transitionScript ? edgeAdditionalInfo.transitionScript.toString() : undefined,
                                messageBinding: edgeAdditionalInfo.messageBinding ? edgeAdditionalInfo.messageBinding.toString() : undefined,
                              
                                // condition
                                edgeCondition: edgeAdditionalInfo.edgeCondition ? edgeAdditionalInfo.edgeCondition.toString() : undefined
                              }} 
                              onSubmitCallback={props.data.modifyEdgeInfo} 
                              edgeTransitionCategory={props.data.edgeTransitionCategory}
                            />
                          </div>
                        ) : (<></>)
                      }
                    </div>
                  </CardContent>
                </Card>
              </div>
            </EdgeLabelRenderer>
        </>
    )
}
export default SelfConnecting;