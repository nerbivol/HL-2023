package hadoop; 

import java.util.*; 

import java.io.IOException; 
import java.io.IOException; 

import org.apache.hadoop.fs.Path;
import org.apache.hadoop.io.FloatWritable;
import org.apache.hadoop.io.LongWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapred.*;

import java.io.IOException;
import java.util.Iterator;
import java.util.StringTokenizer;

public class ProcessUnits {
    public static class E_EMapper extends MapReduceBase
            implements Mapper<LongWritable, Text, Text, FloatWritable> {

        public void map(LongWritable key, Text value,
                        OutputCollector<Text, FloatWritable> output,
                        Reporter reporter) throws IOException {
            String line = value.toString();
            StringTokenizer s = new StringTokenizer(line, "\t");
            String year = s.nextToken();
            float val;

            while (s.hasMoreTokens()) {
                val = Float.parseFloat(s.nextToken());
                output.collect(new Text(year), new FloatWritable(val));
            }

        }
    }


    public static class E_EReduce extends MapReduceBase implements
            Reducer<Text, FloatWritable, Text, FloatWritable> {

        public void reduce(Text key, Iterator<FloatWritable> values,
                           OutputCollector<Text, FloatWritable> output, Reporter reporter) throws IOException {
            float count = 0;
            float sum = 0;
            while (values.hasNext()) {
                float val = values.next().get();

                sum += val;
                count++;

            }
            float avg = sum / count;
            output.collect(key, new FloatWritable(avg));

        }
    }


    public static void main(String[] args) throws Exception {
        JobConf conf = new JobConf(ProcessUnits.class);

        conf.setJobName("avg_eletricity_units");
        conf.setOutputKeyClass(Text.class);
        conf.setOutputValueClass(FloatWritable.class);
        conf.setMapperClass(E_EMapper.class);
        conf.setCombinerClass(E_EReduce.class);
        conf.setReducerClass(E_EReduce.class);
        conf.setInputFormat(TextInputFormat.class);
        conf.setOutputFormat(TextOutputFormat.class);

        FileInputFormat.setInputPaths(conf, new Path(args[0]));
        FileOutputFormat.setOutputPath(conf, new Path(args[1]));

        JobClient.runJob(conf);
    }
}
